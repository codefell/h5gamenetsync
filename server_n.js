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
            startTime: UpdateHandles.time,
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
                if (player.ready) {
                    var playerInfo = ServerPlayer.getInfo(player);
                    loginPlayer.conn.serverSend({
                        type: "playerReady",
                        playerInfo: playerInfo,
                        playerId: player.id,
                    });
                }
            }
        }
    },
    onReady: function (server, conn, msg) {
        var player = MapList.get(server.players, conn.id);
        ServerPlayer.setPlayerInfo(player,
            msg.playerInfo);
        player.ready = true;
        var readyNum = 0;
        for (var i in server.players.list) {
            var player = server.players.list[i];
            if (player.ready == true) {
                readyNum++;
            }
            if (player.id != conn.id) {
                player.conn.serverSend({
                    type: "playerReady",
                    playerInfo: msg.playerInfo,
                    playerId: conn.id,
                });
            }
        }
        if (readyNum == 2) {
            server.start = true; 
            server.startTime = UpdateHandles.time;
            Server.sendMsg(server, {
                type: 'start',
            });
        }
    },
    onOp: function (server, conn, msg) {
        server.syncState.push({
            playerId: conn.id,
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
        MapList.call(server.players, ServerPlayer.sync, deltaFrame);
    },
    update: function (server) {
        var frameNum = Math.floor(
                (UpdateHandles.time - server.startTime)
                / config.frameInterval);

    //    if (server.syncState.length > 0 || (frameNum % 2 == 0)) {
            var deltaFrame = frameNum - server.syncFrame;

            Server.sync(server, deltaFrame);

            for (var i in server.syncState){
                var playerSyncState = server.syncState[i];
                var player = MapList.get(server.players, playerSyncState.playerId);
                ServerPlayer.setSyncState(player, playerSyncState.units);
            }

            Server.sendMsg(server, {
                type: "sync",
                frameIndex: frameNum,
                syncState: server.syncState,
            });

            //if (server.syncState.length > 0) {
                server.syncState = [];
                server.syncFrame = frameNum;
            //}
     //   }
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
    getInfo: function (sp) {
        var units = [];
        for (var i in sp.units.list) {
            var unit = sp.units.list[i];
            units.push(ServerUnit.getInfo(unit));
        }
        var info = {
            units: units,
        };
        return info;
    },
    setSyncState: function (sp, unitsInfo) {
        for (var i in unitsInfo) {
            var unitInfo = unitsInfo[i];
            var unit = MapList.get(sp.units, unitInfo.id);
            ServerUnit.setSyncState(unit, unitInfo);
        }
    },
    setPlayerInfo: function (sp, playerInfo) {
        var unitsInfo = playerInfo.units;
        for (var i in unitsInfo) {
            var unitInfo = unitsInfo[i];
            var unit = ServerUnit.create(unitInfo.id,
                unitInfo.x,
                unitInfo.y,
                unitInfo.speed);
            MapList.add(sp.units, unit);
        }
    },
    sync: function (sp, deltaFrame) {
        MapList.call(sp.units, ServerUnit.sync, deltaFrame);
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
    getInfo: function(su) {
        return {
            id: su.id,
            x: su.pos.x,
            y: su.pos.y,
            speed: su.speed,
        };
    },
    setSyncState: function (su, unitInfo) {
        if (unitInfo.target) {
            su.target = unitInfo.target;
        }
        if (unitInfo.speed) {
            su.speed = unitInfo.speed;
        }
    },
    sync: function (su, deltaFrame) {
        var oldPos = su.pos.clone();
        su.pos = util.move(su.pos,
            su.target, su.speed, deltaFrame * config.frameInterval);
    },
};
