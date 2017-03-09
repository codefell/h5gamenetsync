var Client = {
    allClient: [],
    create: function(divId, color) {
        var je = $("#" + divId);
        var client = {
            color: color,
            game: ClientGame.create(divId, color),
            divId: divId,
            sceneInfo: initScene(divId),
            width: je.width(),
            height: je.height(),
        };
        Client.allClient[divId] = client;
        var updateHandle = 
            UpdateHandles.addUpdate(Client.update, client);
        var conn = new Connection(divId, 0.1, 0.02,
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
    login: function (client) {
        client.conn.clientSend({
            type: 'login',
        });
    },
    onAddPlayer: function (client, msg) {
        ClientGame.addPlayer(client, msg.playerId, msg.color);
    },
    ready: function (client) {
        var player = ClientGame.getLocalPlayer(client.cg);
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
        ClientGame.start(client.cg);
    },
    onSync: function (client, msg) {
        ClientGame.sync(client.cg, msg.frameIndex,
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
    create: function (playerId, color) {
        //syncTime = startTime + syncFrame * config.frameInterval
        var game = {
            start: false,
            color: color,
            syncFrame: 0,
            startTime: 0,
            showCpStart: 0,
            showCpLast: 0,
            playerId: playerId,
            players: MapList.create(),
        };
        ClientGame.addPlayer(game, game.playerId, game.color);
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
        ClientPlayer.addUnit(MapList.get(cg.players, cg.playerId), x, y, speed);
    },

    addPlayer: function (cg, playerId, color) {
        MapList.add(cg.players,
            ClientPlayer.create(playerId, color));
    },

    sync: function (cg, syncFrame, syncState) {
        var syncDeltaFrame = syncFrame - cg.syncFrame;
        var simuDeltaFrame = Math.floor(
            (UpdateHandles.time - cg.startTime)
            / confgi.frameInterval) - syncFrame;
        cg.showCpStart = UpdateHandles.time;
        cg.showCpLast = cg.showCpStart;
        for (var i = 0; i < syncDeltaFrame; i++) {
            MapList.call(cg.players, ClientPlayer.sync1f);
            cg.syncFrame++;
        }
        for (var i = 0; i < simuDeltaFrame; i++) {
            MapList.call(cg.players, ClientPlayer.simu1f);
        }
        MapList.setCompensate(cg.players, ClientPlayer.setCompensate);
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
            for (var i = 0; i < simuDeltaFrame; i++) {
                var cpHead = Math.min(cg.startTime + cg.syncFrame * config.frameInterval,
                        cg.showCpStart + 100);
                var cpAlpha = (cpHead - cg.showCpLast) / 100;
                MapList.call(cg.players, ClientPlayer.update1f, cpAlpha);
                cg.showCpLast = cpHead;
            }
        }
    },
};

var ClientPlayer = {
    id: 0,
    nextId: function () {
        return ++ClientPlayer.id;
    },
    create: function (id, color) {
        return {
            id: id,
            color: color,
            units: MapList.create(),
        };
    },
    setSyncState: function (cp, syncState) {
        for (var i in syncState) {
            var unitSyncState = syncState[i];
            var unit = MapList.get(unitSyncState.id);
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
            color: cp.color,
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
                unit.speed,
                playerInfo.color);
        }
    },
    addUnits: function (cp, unitsInfo) {
        for (var i in unitsInfo) {
            var unitInfo = unitsInfo[i];
            ClientPlayer.addUnit(cp,
                unitInfo.id,
                unitInfo.x,
                unitInfo.y,
                unitInfo.speed,
                unitInfo.color);
        }
    },
    addUnit: function (cp, id, x, y, speed, color) {
        if (id == 0) {
            id = ClientUnit.nextId();
        }
        MapList.add(cp.units,
            ClientUnit.create(id, x, y, speed, color));
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
    update1f: function (cp) {
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
    create: function (id, x, y, speed, color) {
        return {
            id: id,
            color: color,
            sprite: newPlane(x, y, 20, 20, color),
            sync: {
                pos: new THREE.Vector3(x, y),
                target: new THREE.Vector3(x, y),
                speed: 0,
            },
            simu: {
                pos: new THREE.Vector3(x, y),
            },
            show: {
                pos: new THREE.Vector3(x, y),
                cpPos: new THREE.Vector3(),
            },
        };
    },

    sync1f: function (cu) {
        this.pos = util.move(cu.sync.pos,
                cu.sync.target, cu.sync.speed, config.frameInterval);
        ClientUnit.setCompensate(cu);
    },

    setCompensate: function (cu) {
        cu.show.cpPos.copy(cu.simu.pos).sub(cu.show.pos);
    },

    simu1f: function (cu) {
        var oldSimuPos = cu.simu.pos.clone();
        cu.simu.pos = util.move(cu.sync.pos,
                cu.sync.target, cu.speed, config.frameInterval);
        return cu.simu.pos.clone().sub(oldSimuPos);
    },

    update1f: function (cu, cpAlpha) {
        var translate = cu.simu();
        cu.show.pos.add(translate);
        var cpPos = cu.show.cpPos.clone().multiplyScalar(cpAlpha);
        cu.show.pos.add(cpPos);

        cu.sprite.position.x = cu.show.pos.x;
        cu.sprite.position.y = cu.show.pos.y;
    },
};
