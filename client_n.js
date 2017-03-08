var Client {
    allClient: [],
    create: function(divId, color) {
        var je = $("#" + divId);
        var client = {
            color: color,
            game: ClientGame.create(),
            divId: divId,
            sceneInfo: initScene(divId),
            width: je.width(),
            height: je.height(),
        };
        ClientGame.allClient[divId] = client;
        var updateHandle = 
            UpdateHandles.addUpdate(Client.update, client);
        var conn = new Connection(divId, 0.1, 0.02,
            Server.recvHandle,
            function (o) {
                return function (msg) {
                    Client.recvHandler(o, msg);
                };
            }(client));
        client.conn = conn;
        client.updateHandle = updateHandle;
        return client;
    };
    addLocalUnits: function (client, unitsInfo) {
        for (var i in unitsInfo) {
            ClientGame.addLocalUnit(client.game,
                unitsInfo[i].x,
                unitsInfo[i].y,
                unitsInfo[i].speed);
        }
    },
    login: function (client) {
        client.conn.clientSend([
            type: 'login',
        ]);
    },
    ready: function (client) {
        client.conn.clientSend([
            type: 'ready',
            playerInfo: Client.getPlayerInfo(client),
        ]);
    },
    onAddPlayer: function (client, msg) {
        ClientGame.addPlayer(client, msg.playerId);
    },
    onPlayerReady: function (client, msg) {
        ClientGame.getPlayer(client, msg.playerId)
            .setInfo(msg.playerInfo);
    },
    onStart: function (client, msg) {

    },
    onSync: function (client, msg) {
    },
    recvHandler: function (client, msg) {
        var method = "on" + util.headCharUp(msg.type);
        Client[method](client, msg);
    },
    update: function (client) {
        ClientGame.update(client.game);
    },
};

var ClientGame {
    create: function (playerId) {
        //syncTime = startTime + syncFrame * config.frameInterval
        var game = {
            syncFrame: 0,
            startTime: 0,
            showCpStart: 0,
            showCpLast: 0,
            playerId: playerId,
            players: MapList.create(),
        };
    },

    getPlayer: function (cg, playerId) {
        return MapList.get(cg.players, playerId); 
    },

    getLocalPlayer: function(cg) {
        return ClientGame.getPlayer(cg, cg.playerId);
    };

    addLocalUnit: function (cg, x, y, speed) {
        ClientPlayer.addUnit(MapList.get(cg.players, cg.playerId), x, y, speed);
    },

    addPlayer: function (cg, playerId) {
        MapList.add(cg.players,
            ClientPlayer.create(playerId));
    },

    sync: function (cg, syncFrame) {
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

var ClientPlayer {
    create: function (id) {
        return {
            id: id,
            units: MapList.create();
        };
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
    setInfo: function (cp, playerInfo) {
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
    };
    addUnit: function (cp, id, x, y, speed) {
        if (id == 0) {
            id = ClientUnit.nextId();
        }
        MapList.add(cp.units,
            ClientUnit.create(id, x, y, speed));
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

var ClientUnit {
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
    create: function (id, x, y, speed) {
        return {
            id: id
            sync: {
                this.pos = new THREE.Vector3(x, y),
                this.target = new THREE.Vector3(x, y),
                this.speed = 0,
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
