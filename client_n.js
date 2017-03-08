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
    addUnits: function (client, unitsInfo) {
        for (var i in unitsInfo) {
            Client.addUnit(client,
                unitsInfo[i].x,
                unitsInfo[i].y,
                unitsInfo[i].speed);
        }
    },
    addUnit: function (client, x, y, speed) {
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
    getPlayerInfo: function (client) {
        var player = client.game.players.get(client.divId);
        var playerInfo = [];
        for (var i in player.units.list) {
            var unit = player.units.list[i];
            playerInfo.push({
                id: unit.id
                x: unit.sync.x,
                y: unit.sync.y,
                speed: unit.sync.speed,
            });
        }
        return playerInfo;
    },
    onAddPlayer: function (client, msg) {
        MapList.add(client.game.players, ClientPlayer.create(msg.playerId));
    },
    onStart: function (client, msg) {
    },
    onSync: function (client, msg) {
    },
    recvHandler: function (client, msg) {
    },
    start: function (client) {
    },
    update: function (client) {
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
