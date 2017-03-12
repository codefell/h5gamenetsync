var Client = {
    allClient: [],
    create: function(divId, color) {
        var je = $("#" + divId);
        var client = {
            color: color,
            divId: divId,
            sceneInfo: initScene(divId),
            width: je.width(),
            height: je.height(),
        };
        client.game = ClientGame.create(divId, color, client),
        Client.allClient[divId] = client;
        util.makeGrid(client.sceneInfo.scene,
            20,
            je.width(),
            je.height());

        var updateHandle = 
            UpdateHandles.addUpdate(Client.update, client);

        var conn = new Connection(divId, 0, 0,
            Server.getRecvHandle(Server.getInst()),
            function (o) {
                return function (msg) {
                    Client.recvHandler(o, msg);
                };
            }(client));

        client.conn = conn;
        client.updateHandle = updateHandle;
        return client;
    },
    addLocalUnits: function (client, unitsInfo) {
        for (var i in unitsInfo) {
            ClientGame.addLocalUnit(client.game,
                unitsInfo[i].x,
                unitsInfo[i].y,
                unitsInfo[i].speed,
                client.color);
        }
    },
    opTest1: function (client) {
        client.conn.clientSend({
            type: "op",
            unitsInfo: [
                {
                    id: 2,
                    speed: 70,
                },
            ],
        });
    },
    opTest: function (client) {
        /*
        for (var i in Client.allClient) {
            var c = Client.allClient[i];
            c.sceneInfo.scene.add(util.newPlane(100, 20, 20, 20, 0x0000ff));
        }
        */
        client.conn.clientSend({
            type: "op",
            unitsInfo: [
                {
                    id: 1,
                    target: new THREE.Vector3(50, 0, 0),
                },
            ],
        })
    },
    login: function (client) {
        client.conn.clientSend({
            type: 'login',
            color: client.color,
        });
    },
    onAddPlayer: function (client, msg) {
        ClientGame.addPlayer(client.game, msg.playerId, msg.color);
    },
    ready: function (client) {
        var player = ClientGame.getLocalPlayer(client.game);
        var playerInfo = ClientPlayer.getInfo(player);
        client.conn.clientSend({
            type: 'ready',
            playerInfo: playerInfo,
        });
    },
    onPlayerReady: function (client, msg) {
        ClientPlayer.initInfo(ClientGame.getPlayer(client.game, msg.playerId),
            msg.playerInfo);
    },
    onStart: function (client, msg) {
        ClientGame.start(client.game);
    },
    onSync: function (client, msg) {
        ClientGame.sync(client.game, msg.frameIndex,
            msg.syncState);
    },

    recvHandler: function (client, msg) {
        var method = "on" + util.headCharUp(msg.type);
        Client[method](client, msg);
    },
    update: function (client) {
        ClientGame.update(client.game);
    },
};

var ClientGame = {
    create: function (playerId, color, client) {
        var game = {
            client: client,
            start: true,
            syncFrame: 0,
            simuFrame: 0,
            startTime: UpdateHandles.time,
            showCpStart: 0,
            showCpLast: 0,
            playerId: playerId,
            players: MapList.create(),
            syncInfo: [],
        };
        ClientGame.addPlayer(game, game.playerId, color);
        return game;
    },

    start: function (cg) {
        cg.start = true;
        cg.startTime = UpdateHandles.time;
    },

    getPlayer: function (cg, playerId) {
        return MapList.get(cg.players, playerId); 
    },

    getLocalPlayer: function(cg) {
        return ClientGame.getPlayer(cg, cg.playerId);
    },

    addLocalUnit: function (cg, x, y, speed) {
        var player = ClientGame.getLocalPlayer(cg);
        ClientPlayer.addUnit(player, 0, x, y, speed, player);
    },

    addPlayer: function (cg, playerId, color) {
        MapList.add(cg.players,
            ClientPlayer.create(playerId, color, cg));
    },

    sync: function (cg, syncFrame, allPlayerSyncInfo) {
        cg.syncInfo.push({
            syncFrame: syncFrame,
            allPlayerSyncInfo: allPlayerSyncInfo,
        });
    },

    update: function (cg) {
        var currFrame = Math.floor((UpdateHandles.time - cg.startTime) 
            / config.frameInterval);
        var deltaSimuFrame = currFrame - cg.simuFrame;
        var cpHead = Math.min(
                cg.showCpStart + 6,
                currFrame);
        var cpAlpha = (cpHead - cg.showCpLast) / 6;
        cg.showCpLast = cpHead;
        MapList.call(cg.players, ClientPlayer.simuShow, deltaSimuFrame, cpAlpha);
        cg.simuFrame = currFrame;

        if (cg.syncInfo.length > 0) {
            for (var i in cg.syncInfo) {
                var deltaSyncFrame = cg.syncInfo[i].syncFrame - cg.syncFrame;
                MapList.call(cg.players, ClientPlayer.sync, deltaSyncFrame);
                cg.syncFrame = cg.syncInfo[i].syncFrame;
                for (var j in cg.syncInfo[i].allPlayerSyncInfo) {
                    var playerSyncInfo = cg.syncInfo[i].allPlayerSyncInfo[j];
                    var player = MapList.get(cg.players, playerSyncInfo.playerId);
                    ClientPlayer.setSyncInfo(player, playerSyncInfo.units);
                }
            }
            //limit simu frame num, (simuFrame - syncFrame) < limitFrameNum
            //wait for new syncinfo
            var deltaSimuFrame = currFrame - cg.syncFrame;
            MapList.call(cg.players, ClientPlayer.simu, deltaSimuFrame);
            cg.simuFrame = currFrame;
            MapList.call(cg.players, ClientPlayer.setCompensate);
            cg.showCpStart = currFrame;
            cg.showCpLast = currFrame;
            cg.syncInfo = [];
        }
        MapList.call(cg.players, ClientPlayer.update);
    },
};

var ClientPlayer = {
    id: 0,
    nextId: function () {
        return ++ClientPlayer.id;
    },
    create: function (id, color, game) {
        return {
            id: id,
            color: color,
            game: game,
            units: MapList.create(),
        };
    },
    setSyncInfo: function (cp, syncState) {
        for (var i in syncState) {
            var unitSyncState = syncState[i];
            var unit = MapList.get(cp.units, unitSyncState.id);
            ClientUnit.setSyncInfo(unit, unitSyncState);
        }
    },
    getInfo: function (cp) {
        var units = [];
        for (var i in cp.units.list) {
            var unit = cp.units.list[i];
            units.push(ClientUnit.getInfo(unit));
        }
        var info = {
            units: units,
        };
        return info;
    },
    initInfo: function (cp, playerInfo) {
        for (var i in playerInfo.units) {
            var unit = playerInfo.units[i];
            ClientPlayer.addUnit(cp,
                unit.id,
                unit.x,
                unit.y,
                unit.speed);
        }
    },
    addUnits: function (cp, unitsInfo) {
        for (var i in unitsInfo) {
            var unitInfo = unitsInfo[i];
            ClientPlayer.addUnit(cp,
                unitInfo.id,
                unitInfo.x,
                unitInfo.y,
                unitInfo.speed);
        }
    },
    addUnit: function (cp, id, x, y, speed) {
        if (id == 0) {
            id = ClientUnit.nextId();
        }
        MapList.add(cp.units,
            ClientUnit.create(id, x, y, speed, cp));
    },
    sync: function (cp, deltaFrame) {
        MapList.call(cp.units, ClientUnit.sync, deltaFrame);
    },
    simu: function (cp, deltaFrame) {
        MapList.call(cp.units, ClientUnit.simu, deltaFrame);
    },
    setCompensate: function (cp) {
        MapList.call(cp.units, ClientUnit.setCompensate);
    },
    simuShow: function (cp, deltaFrame, cpAlpha) {
        MapList.call(cp.units, ClientUnit.simuShow, deltaFrame, cpAlpha);
    },
    update: function (cp) {
        MapList.call(cp.units, ClientUnit.update);
    },
};

var ClientUnit = {
    id: 0,
    nextId: function () {
        return ++ClientUnit.id;
    },
    getInfo: function(cu) {
        return {
            id: cu.id,
            x: cu.sync.pos.x,
            y: cu.sync.pos.y,
            speed: cu.sync.speed,
        };
    },
    setSyncInfo: function(cu, syncState) {
        if (syncState.target) {
            cu.sync.target = syncState.target;
        }
        if (syncState.speed) {
            cu.sync.speed = syncState.speed;
        }
    },
    create: function (id, x, y, speed, player) {
        var unit = {
            id: id,
            color: player.color,
            player: player,
            sprite: util.newPlane(util.gridX(x), util.gridY(y), 20, 20, player.color),
            sync: {
                pos: new THREE.Vector3(x, y, 0),
                target: new THREE.Vector3(x, y, 0),
                speed: speed,
            },
            simu: {
                pos: new THREE.Vector3(x, y, 0),
            },
            show: {
                pos: new THREE.Vector3(x, y, 0),
                cpPos: new THREE.Vector3(),
            },
        };
        unit.player.game.client.sceneInfo.scene.add(unit.sprite);
        return unit;
    },

    sync: function (cu, deltaFrame) {
        cu.sync.pos = util.move(cu.sync.pos,
                cu.sync.target, cu.sync.speed, deltaFrame * config.frameInterval);
        cu.simu.pos.copy(cu.sync.pos);
    },

    setCompensate: function (cu) {
        cu.show.cpPos.copy(cu.simu.pos).sub(cu.show.pos);
    },

    simu: function (cu, deltaFrame) {
        var oldSimuPos = cu.simu.pos.clone();
        cu.simu.pos = util.move(cu.simu.pos,
                cu.sync.target, cu.sync.speed, deltaFrame * config.frameInterval);
        return cu.simu.pos.clone().sub(oldSimuPos);
    },

    simuShow: function (cu, deltaFrame, cpAlpha) {
        var deltaSimuPos = ClientUnit.simu(cu, deltaFrame);
        cu.show.pos.add(deltaSimuPos);
        var cpPos = cu.show.cpPos.clone().multiplyScalar(cpAlpha);
        cu.show.pos.add(cpPos)
    },

    update: function (cu, frame, simuFrame, cpAlpha) {
        cu.sprite.position.x = util.gridX(cu.show.pos.x);
        cu.sprite.position.y = util.gridY(cu.show.pos.y);
    },
};
