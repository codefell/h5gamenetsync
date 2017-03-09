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
        client.sceneInfo.scene.add(util.newPlane(0, 0, 10, 10, 0x0000ff));
        client.game = ClientGame.create(divId, color, client),
        Client.allClient[divId] = client;
        var updateHandle = 
            UpdateHandles.addUpdate(Client.update, client);
        var conn = new Connection(divId, 0.0, 0.00,
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
    opTest: function (client) {
        client.sceneInfo.scene.add(util.newPlane(200, 200, 10, 10, 0x0000ff));
        client.conn.clientSend({
            type: "op",
            unitsInfo: [
                {
                    id: 1,
                    target: new THREE.Vector3(200, 200),
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
        ClientGame.addPlayer(client, msg.playerId, msg.color);
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
        ClientGame.getPlayer(client, msg.playerId)
            .initInfo(msg.playerInfo);
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
        //syncTime = startTime + syncFrame * config.frameInterval
        var game = {
            client: client,
            start: true,
            syncFrame: 0,
            startTime: UpdateHandles.time,
            showCpStart: 0,
            showCpLast: 0,
            playerId: playerId,
            players: MapList.create(),
        };
        ClientGame.addPlayer(game, game.playerId, color);
        return game;
    },

    start: function (cg) {
        cg.start = true;
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

    sync: function (cg, syncFrame, syncState) {
        var syncDeltaFrame = syncFrame - cg.syncFrame;
        var simuDeltaFrame = Math.floor(
            (UpdateHandles.time - cg.startTime)
            / config.frameInterval) - syncFrame;
        cg.showCpStart = UpdateHandles.time;
        cg.showCpLast = cg.showCpStart;
        for (var i = 0; i < syncDeltaFrame; i++) {
            MapList.call(cg.players, ClientPlayer.sync1f);
            cg.syncFrame++;
        }
        for (var i = 0; i < simuDeltaFrame; i++) {
            MapList.call(cg.players, ClientPlayer.simu1f);
        }
        MapList.call(cg.players, ClientPlayer.setCompensate);
        for (var i in syncState) {
            var playerSyncState = syncState[i];
            var player = MapList.get(cg.players, playerSyncState.playerId);
            ClientPlayer.setSyncState(player, playerSyncState.units);
        }
    },

    update: function (cg) {
        var deltaTime = UpdateHandles.time 
            - (cg.startTime + cg.syncFrame * config.frameInterval);
        var deltaFrame = Math.floor((UpdateHandles.time - cg.startTime) / config.frameInterval)
            - cg.syncFrame;
        if (deltaFrame > 0) {
            for (var i = 0; i < deltaFrame; i++) {
                var cpHead = Math.min(cg.startTime + cg.syncFrame * config.frameInterval,
                        cg.showCpStart + 100);
                var cpAlpha = (cpHead - cg.showCpLast) / 100;
                MapList.call(cg.players, ClientPlayer.update1f, cpAlpha);
                cg.showCpLast = cpHead;
            }
        }
        //test
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
    setSyncState: function (cp, syncState) {
        for (var i in syncState) {
            var unitSyncState = syncState[i];
            var unit = MapList.get(cp.units, unitSyncState.id);
            ClientUnit.setSyncState(unit, unitSyncState);
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
    sync1f: function (cp) {
        MapList.call(cp.units, ClientUnit.sync1f);
    },
    simu1f: function (cp) {
        MapList.call(cp.units, ClientUnit.simu1f);
    },
    setCompensate: function (cp) {
        MapList.call(cp.units, ClientUnit.setCompensate);
    },
    update1f: function (cp, cpAlpha) {
        MapList.call(cp.units, ClientUnit.update1f, cpAlpha);
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
    setSyncState: function(cu, syncState) {
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
            sprite: util.newPlane(x, y, 20, 20, player.color),
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

    sync1f: function (cu) {
        cu.sync.pos = util.move(cu.sync.pos,
                cu.sync.target, cu.sync.speed, config.frameInterval);
        cu.simu.pos.copy(cu.sync.pos);
    },

    setCompensate: function (cu) {
        cu.show.cpPos.copy(cu.simu.pos).sub(cu.show.pos);
    },

    simu1f: function (cu) {
        var oldSimuPos = cu.simu.pos.clone();
        cu.simu.pos = util.move(cu.simu.pos,
                cu.sync.target, cu.sync.speed, config.frameInterval);
        return cu.simu.pos.clone().sub(oldSimuPos);
    },

    update1f: function (cu, cpAlpha) {
        var translate = ClientUnit.simu1f(cu);
        cu.show.pos.add(translate);
        var cpPos = cu.show.cpPos.clone().multiplyScalar(cpAlpha);
        cu.show.pos.add(cpPos);
    },

    update: function (cu) {
        cu.sprite.position.x = cu.show.pos.x;
        cu.sprite.position.y = cu.show.pos.y;
    },
};
