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
    opFire: function (client) {
        var unit = client.game.players.list[0].units.list[0];
        client.conn.clientSend({
            type: "op",
            firesInfo: [
                {
                    id: unit.id,
                    bulletId: ClientUnit.nextId(),
                    speed: 50,
                },
            ],
        });
    },
    opTest1: function (client) {
        var unit = client.game.players.list[0].units.list[0];
        client.conn.clientSend({
            type: "op",
            unitsInfo: [
                {
                    id: unit.id,
                    speed: 70,
                },
            ],
        });
    },
    opTest: function (client) {
        var unit = client.game.players.list[0].units.list[0];
        var status = "move";
        if (unit.sync.status == "move") {
            status = "idle";
        }
        client.conn.clientSend({
            type: "op",
            unitsInfo: [
                {
                    id: unit.id,
                    status: status,
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
            msg.syncInfo);
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
        deltaSimuFrame = Math.min(deltaSimuFrame, 6);
        for (var i = 0; i < deltaSimuFrame; i++) {
            var cpAlpha = 0;
            if (cg.showCpLast < cg.showCpStart + 6) {
                cpAlpha = 1 / 6;
                cg.showCpLast++;
            }
            //which should be evaled first, pos or ai
            MapList.call(cg.players, ClientPlayer.simu1f);
            MapList.call(cg.players, ClientPlayer.show1f, cpAlpha);
            cg.simuFrame++;
        }

        if (cg.syncInfo.length > 0) {
            for (var i in cg.syncInfo) {
                var deltaSyncFrame = cg.syncInfo[i].syncFrame - cg.syncFrame;
                for (var j = 0; j < deltaSyncFrame; j++) {
                    MapList.call(cg.players, ClientPlayer.sync1f);
                    cg.syncFrame++;
                }
                for (var j in cg.syncInfo[i].allPlayerSyncInfo) {
                    var playerSyncInfo = cg.syncInfo[i].allPlayerSyncInfo[j];
                    var player = MapList.get(cg.players, playerSyncInfo.playerId);
                    ClientPlayer.setSyncInfo(player, playerSyncInfo);
                }
            }
            //limit simu frame num, (simuFrame - syncFrame) < limitFrameNum
            //wait for new syncinfo
            cg.simuFrame = cg.syncFrame;
            var deltaSimuFrame = currFrame - cg.syncFrame;
            deltaSimuFrame = Math.min(deltaSimuFrame, 6);
            for (var i = 0; i < deltaSimuFrame; i++) {
                MapList.call(cg.players, ClientPlayer.simu1f);
                cg.simuFrame++;
            }

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
    setSyncInfo: function (cp, syncInfo) {
        var unitsInfo = syncInfo.unitsInfo || [];
        for (var i in unitsInfo) {
            var unitInfo = unitsInfo[i];
            var unit = MapList.get(cp.units, unitInfo.id);
            ClientUnit.setSyncInfo(unit, unitInfo);
        }

        var firesInfo = syncInfo.firesInfo || [];
        for (var i in firesInfo) {
            var fireInfo = firesInfo[i];
            var unit = MapList.get(cp.units, fireInfo.id);
            //ClientPlayer.addUnit(cp, fireInfo.bulletId, unit.sync.pos.x, 1, fireInfo.speed);
            ClientUnit.fire(unit, fireInfo.bulletId, fireInfo.speed);
            //bulletUnit.sync.fireInfo = {
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
        var unit = ClientUnit.create(id, x, y, speed, cp);
        MapList.add(cp.units, unit);
        return unit;
    },
    sync1f: function (cp) {
        MapList.call(cp.units, ClientUnit.sync1f);
    },
    simu1f: function (cp) {
        MapList.call(cp.units, ClientUnit.simu1f);
    },
    show1f: function (cp, cpAlpha) {
        MapList.call(cp.units, ClientUnit.show1f, cpAlpha);
    },
    setCompensate: function (cp) {
        MapList.call(cp.units, ClientUnit.setCompensate);
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
    fire: function (cu, id, speed) {
        cu.fireInfo = {
            id: id,
            speed: speed,
            fireFrame: cu.player.game.syncFrame + 6,
        };
    },
    setSyncInfo: function(cu, syncInfo) {
        if (syncInfo.status) {
            console.log(syncInfo.status);
            cu.sync.status = syncInfo.status;
        }
        if (syncInfo.speed) {
            cu.sync.speed = syncInfo.speed;
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
                direction: new THREE.Vector3(1, 0, 0),
                status: "idle",
                speed: speed,
            },
            simu: {
                pos: new THREE.Vector3(x, y, 0),
                lastSimuTranslate: new THREE.Vector3(),
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
        if (cu.sync.status == "move") {
            cu.sync.pos = util.move(cu.sync.pos,
                    cu.sync.direction, cu.sync.speed, config.frameInterval);
            cu.simu.pos.copy(cu.sync.pos);
        }
        if (cu.player.game.syncFrame % 1 == 0) {
            if (cu.fireInfo) {
                if (cu.player.game.syncFrame >= cu.fireInfo.fireFrame) {
                    var unit = ClientPlayer.addUnit(cu.player,
                        cu.fireInfo.id,
                        cu.sync.pos.x,
                        1,
                        cu.fireInfo.speed);
                    unit.sync.status = "move";
                    unit.sync.direction.copy(cu.sync.direction);
                    cu.fireInfo = undefined;
                }
            }
        }
    },

    simu1f: function (cu) {
        if (cu.sync.status == "move") {
            var oldSimuPos = cu.simu.pos.clone();
            cu.simu.pos = util.move(cu.simu.pos,
                    cu.sync.direction, cu.sync.speed, config.frameInterval);
            cu.simu.lastSimuTranslate.copy(cu.simu.pos).sub(oldSimuPos);
        }
        if (cu.player.game.simuFrame % 1 == 0) {
            //simuai
        }
    },

    setCompensate: function (cu) {
        cu.show.cpPos.copy(cu.simu.pos).sub(cu.show.pos);
    },

    show1f: function (cu, cpAlpha) {
        //var deltaSimuPos = ClientUnit.simu(cu, deltaFrame);
        //cu.show.pos.add(deltaSimuPos);
        cu.show.pos.add(cu.simu.lastSimuTranslate);
        cu.simu.lastSimuTranslate.set(0, 0, 0);
        var cpPos = cu.show.cpPos.clone().multiplyScalar(cpAlpha);
        cu.show.pos.add(cpPos)
    },

    update: function (cu) {
        cu.sprite.position.x = util.gridX(cu.show.pos.x);
        cu.sprite.position.y = util.gridY(cu.show.pos.y);
    },
};
