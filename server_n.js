var Server = {
    inst: null,
    getInst: function () {
        if (Server.inst == null) {
            Server.inst = Server.create();
        }
        return Server.inst;
    },
    getRecvHandle: function (server) {
        return function (conn, msg) {
            Server.recvHandle(server, conn, msg);
        };
    },
    recvHandle: function (server, conn, msg) {
        var method = "on" + util.headCharUp(msg.type);
        Server[method](server, conn, msg);
    },
    create: function () {
        return {
            players: MapList.create(),
            start: false,
            syncFrame: 0,
            startTime: 0,
            shouldSync: false,
            syncState: [],
        };
    },
    onLogin: function (server, conn, msg) {
        var loginPlayer = ServerPlayer.create(conn, msg.color);
        MapList.add(server.players, loginPlayer);
        for (var i in server.players.list) {
            var player = server.players.list[i];
            if (player.id != conn.id) {
                player.conn.serverSend({
                    type: "addPlayer",
                    playerId: loginPlayer.id,
                    color: loginPlayer.color,
                });
                loginPlayer.conn.serverSend({
                    type: "addPlayer",
                    playerId: player.id,
                    color: player.color,
                });
            }
        }
    },
    onReady: function (server, conn, msg) {
        var player = MapList.get(conn.id);
        ServerPlayer.setPlayerInfo(player,
            msg.playerInfo);
        player.ready = true;
        var start = true;
        for (var i in server.players.list) {
            var player = server.players.list[i];
            if (player.ready == false) {
                start = false;
            }
            if (player.id != conn.id) {
                player.conn.serverSend({
                    type: "playerReady",
                    playerInfo: msg.playerInfo,
                });
            }
        }
        if (start) {
            server.start = true; 
            server.startTime = UpdateHandles.time;
            ServerGame.sendMsg(server, {
                type: 'start',
            });
        }
    },
    onOp: function (server, conn, msg) {
        var deltaFrame = Math.floor(
            (UpdateHandles.time - server.startTime)
            / config.frameInterval);
        Server.sync(server, deltaFrame);
        var player = MapList.get(server.players, conn.id);
        ServerPlayer.setSyncState(player, msg.unitsInfo);
        server.shouldSync = true;
        server.syncState.push({
            playerId: player.id,
            units: msg.unitsInfo,
        });
    },
    sendMsg: function (server, msg) {
        for (var i in server.players.list) {
            var player = server.players.list[i];
            player.conn.serverSend(msg);
        }
    },
    sync: function (server, deltaFrame) {
        for (var i = 0; i < deltaFrame; i++) {
            MapList.call(server.players, ServerPlayer.sync1f);
            server.syncFrame++;
        }
    },
    update: function (server) {
        if (server.shouldSync == false) {
            if (server.syncFrame % 2 == 0) {
                server.shouldSync = true;
            }
        }
        if (server.shouldSync) {
            Server.sendMsg(server, {
                type: "sync",
                frameIndex: server.syncFrame,
                syncState: server.syncState,
            });
            server.syncState = [];
            server.shouldSync = false;
        }
    },
};

var ServerPlayer = {
    create: function (conn, color) {
        return {
            id: conn.id,
            conn: conn,
            color: color,
            ready: false,
            units: MapList.create(),
        };
    },
    setPlayerInfo: function (sp, playerInfo) {
        var unitsInfo = playerInfo.units;
        for (var i in unitsInfo) {
            var unitInfo = unitsInfo[i];
            var unit = ServerUnit.create(unitInfo.id,
                unitsInfo.x,
                unitsInfo.y,
                unitsInfo.speed);
            MapList.add(sp.units, unit);
        }
    },
    sync1f: function (sp) {
        MapList.call(sp.units, ServerUnit.sync1f);
    },
};

var ServerUnit = {
    create: function (id, x, y, speed) {
        return {
            id: id,
            pos: new THREE.Vector3(x, y, 0),
            target: new THREE.Vector3(x, y, 0),
            speed: speed,
        };
    },
    sync1f: function (su) {
        this.pos = util.move(su.sync.pos,
            su.sync.target, su.sync.speed, config.frameInterval);
    },
};
