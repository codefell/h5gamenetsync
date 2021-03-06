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
            syncInfo: [],
            syncSeq: [],
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
        server.syncInfo.push({
            playerId: conn.id,
            unitsInfo: msg.unitsInfo,
            firesInfo: msg.firesInfo,
        });
    },
    sendMsg: function (server, msg) {
        for (var i in server.players.list) {
            var player = server.players.list[i];
            player.conn.serverSend(msg);
        }
    },
    update: function (server) {
        var frameNum = Math.floor(
                (UpdateHandles.time - server.startTime)
                / config.frameInterval);

        /*
        if (server.syncInfo.length > 0 || (frameNum % 2 == 0)) {
            var deltaFrame = frameNum - server.syncFrame;

            for (var i = 0; i < deltaFrame; i++) {
                MapList.call(server.players, ServerPlayer.sync1f);
                if ((server.syncFrame + i) % 2 == 0) {
                    MapList.call(server.players, ServerPlayer.syncai1f);
                }
            }

            for (var i in server.syncInfo){
                var playerSyncState = server.syncInfo[i];
                var player = MapList.get(server.players, playerSyncState.playerId);
                ServerPlayer.setSyncInfo(player, playerSyncState);
            }
        }
        */

        if (frameNum % 6 == 0) {
            Server.sendMsg(server, {
                type: "sync",
                frameIndex: frameNum,
                syncInfo: server.syncInfo,
            });

            if (server.syncInfo.length > 0) {
                server.syncSeq.push({frameIndex: frameNum, syncInfo: server.syncInfo});
                server.syncInfo = [];
            }
        }
    },
    eval: function (server) {
        var frameNum = Math.floor(
                (UpdateHandles.time - server.startTime)
                / config.frameInterval);
        frameNum = frameNum - (frameNum % 6);

        var deltaFrame = frameNum - server.syncFrame;

        for (var i = 0; i < deltaFrame; i++) {
            MapList.call(server.players, ServerPlayer.sync1f);
            server.syncFrame++;
            if (server.syncSeq.length > 0) {
                if (server.syncFrame == server.syncSeq[0].frameIndex) {
                    var syncInfo = server.syncSeq[0].syncInfo;
                    for (var j in syncInfo){
                        var playerSyncInfo = syncInfo[j];
                        var player = MapList.get(server.players, playerSyncInfo.playerId);
                        ServerPlayer.setSyncInfo(player, playerSyncInfo);
                    }
                    server.syncSeq.shift();
                }
            }
        }
        if (server.start) {
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
    setSyncInfo: function (sp, syncInfo) {
        var unitsInfo = syncInfo.unitsInfo || [];
        for (var i in unitsInfo) {
            var unitInfo = unitsInfo[i];
            var unit = MapList.get(sp.units, unitInfo.id);
            ServerUnit.setSyncInfo(unit, unitInfo);
        }

        var firesInfo = syncInfo.firesInfo || [];
        for (var i in firesInfo) {
            var fireInfo = firesInfo[i];
            var unit = MapList.get(sp.units, fireInfo.id);
            //ServerPlayer.addUnit(sp, fireInfo.bulletId, unit.pos.x, 1, fireInfo.speed);
            ServerUnit.fire(unit, fireInfo.bulletId, fireInfo.speed);
        }
    },
    addUnit: function (sp, id, x, y, dx, dy, speed) {
        var unit = ServerUnit.create(id, x, y, dx, dy, speed, sp);
        MapList.add(sp.units, unit);
        return unit;
    },
    setPlayerInfo: function (sp, playerInfo) {
        var unitsInfo = playerInfo.units;
        for (var i in unitsInfo) {
            var unitInfo = unitsInfo[i];
            var unit = ServerUnit.create(unitInfo.id,
                unitInfo.x,
                unitInfo.y,
                unitInfo.dx,
                unitInfo.dy,
                unitInfo.speed, sp);
            MapList.add(sp.units, unit);
        }
    },
    sync1f: function (sp) {
        MapList.call(sp.units, ServerUnit.sync1f);
    },
};

var ServerUnit = {
    create: function (id, x, y, dx, dy, speed, player) {
        return {
            id: id,
            pos: new THREE.Vector3(x, y, 0),
            direction: new THREE.Vector3(dx, dy, 0),
            status: "idle",
            speed: speed,
            player: player
        };
    },
    getInfo: function(su) {
        return {
            id: su.id,
            x: su.pos.x,
            y: su.pos.y,
            dx: su.direction.x,
            dy: su.direction.y,
            speed: su.speed,
        };
    },
    fire: function (su, id, speed) {
        su.fireInfo = {
            id: id,
            speed: speed,
            fireFrame: Server.getInst().syncFrame + 6,
        };
    },
    setSyncInfo: function (su, unitInfo) {
        if (unitInfo.direction) {
            su.direction.x = unitInfo.direction.x;
            su.direction.y = unitInfo.direction.y;
        }
        if (unitInfo.status) {
            su.status = unitInfo.status;
        }
        if (unitInfo.speed) {
            su.speed = unitInfo.speed;
        }
    },
    sync1f: function (su) {
        if (su.status == "move") {
            su.pos = util.move(su.pos,
                su.direction, su.speed, config.frameInterval);
        }
        if (Server.getInst().syncFrame % 1 == 0) {
            if (su.fireInfo) {
                if (Server.getInst().syncFrame >= su.fireInfo.fireFrame) {
                    var unit = ServerPlayer.addUnit(su.player,
                        su.fireInfo.id,
                        su.pos.x,
                        su.pos.y,
                        su.direction.x,
                        su.direction.y,
                        su.fireInfo.speed);
                    unit.status = "move";
                    su.fireInfo = undefined;
                }
            }
        }
    },
};
