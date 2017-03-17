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

        $('#'+divId).click(function (e) {
            var rect0 = $(this)[0].getBoundingClientRect();
            var x = Math.floor(e.clientX - rect0.left);
            var y = Math.floor(e.clientY - rect0.top);
            var client = Client.allClient[this.id];
            Client.currOpClient = client;
            x = -(client.width/2 - x);
            y = client.height/2 - y;
            client.conn.clientSend({
                type: "op",
                unitsInfo: [
                    {
                        id: client.game.players.list[0].units.list[0].id,
                        target: new THREE.Vector3(x, y, 0),
                    },
                ],
            });
        });

        return client;
    },
    addLocalUnits: function (client, unitsInfo) {
        for (var i in unitsInfo) {
            ClientGame.addLocalUnit(client.game,
                unitsInfo[i].x,
                unitsInfo[i].y,
                unitsInfo[i].dx,
                unitsInfo[i].dy,
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
        var player = MapList.get(client.game.players, client.divId);
        var unit = player.units.list[0];
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
        var player = MapList.get(client.game.players, client.divId);
        var unit = player.units.list[0];
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
        MapList.sortOnId(cg.players);
    },

    getPlayer: function (cg, playerId) {
        return MapList.get(cg.players, playerId); 
    },

    getLocalPlayer: function(cg) {
        return ClientGame.getPlayer(cg, cg.playerId);
    },

    addLocalUnit: function (cg, x, y, dx, dy, speed) {
        var player = ClientGame.getLocalPlayer(cg);
        ClientPlayer.addUnit(player, 0, x, y, dx, dy, speed, player);
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

    syncCollide: function (cg) {

    },

    simuCollide: function (cg) {
        var units = [];
        MapList.call(cg.players, function (player) {
            MapList.call(player.units, function (unit) {
                units.push(unit);
            });
        });
        for (var i = 0; i < units.length - 1; i++) {
            for (var j = i+1; j < units.length; j++) {
                var u0 = units[i];
                var u1 = units[j];
                if (Math.abs(u0.simu.pos.x - u1.simu.pos.x) < 4) {
                    ClientUnit.onSimuCollide(u0, u1);
                    ClientUnit.onSimuCollide(u1, u0);
                }
            }
        }
    },

    update: function (cg) {
        var currFrame = Math.floor((UpdateHandles.time - cg.startTime) 
            / config.frameInterval);

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
                ClientGame.simuCollide(cg);
                cg.simuFrame++;
            }

            MapList.call(cg.players, ClientPlayer.show1f, 0);
            MapList.call(cg.players, ClientPlayer.setCompensate);
            cg.syncInfo = [];
        }
        else {
            var deltaSimuFrame = currFrame - cg.simuFrame;
            deltaSimuFrame = Math.min(deltaSimuFrame, 6);
            for (var i = 0; i < deltaSimuFrame; i++) {
                //which should be evaled first, pos or ai
                MapList.call(cg.players, ClientPlayer.simu1f);
                ClientGame.simuCollide(cg);
                MapList.call(cg.players, ClientPlayer.show1f);
                cg.simuFrame++;
            }
        }
        MapList.call(cg.players, ClientPlayer.update);
        var unit = cg.players.list[0].units.list[0];
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
                unit.dx,
                unit.dy,
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
                unitInfo.dx,
                unitInfo.dy,
                unitInfo.speed);
        }
    },
    addUnit: function (cp, id, x, y, dx, dy, speed) {
        if (id == 0) {
            id = ClientUnit.nextId();
        }
        var unit = ClientUnit.create(id, x, y, dx, dy, speed, cp);
        MapList.add(cp.units, unit);
        return unit;
    },
    sync1f: function (cp) {
        MapList.call(cp.units, ClientUnit.sync1f);
    },
    simu1f: function (cp) {
        MapList.call(cp.units, ClientUnit.simu1f);
    },
    show1f: function (cp) {
        MapList.call(cp.units, ClientUnit.show1f);
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
            dx: cu.sync.direction.x,
            dy: cu.sync.direction.y,
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
            cu.sync.status = syncInfo.status;
        }
        if (syncInfo.speed) {
            cu.sync.speed = syncInfo.speed;
        }
    },
    create: function (id, x, y, dx, dy, speed, player) {
        var unit = {
            id: id,
            color: player.color,
            player: player,
            sprite: util.newPlane(x, y, 20, 20, player.color),
            /*
            sprite: Sprite.create(util.gridX(x), util.gridY(y), 20, 20, "snake",
                [{name: "idle", num: 6, loop: true},
                 {name: "walk", num: 6, loop: true},
                 {name: "attack", num: 9, loop: true}],
                 dx < 0),
            */
            sync: {
                pos: new THREE.Vector3(x, y, 0),
                direction: new THREE.Vector3(dx, dy, 0),
                status: "move",
                speed: speed,
            },
            simu: {
                pos: new THREE.Vector3(x, y, 0),
                lastSimuTranslate: new THREE.Vector3(),
            },
            show: {
                pos: new THREE.Vector3(x, y, 0),
                speed: speed,
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
                        cu.sync.pos.y,
                        cu.sync.direction.x,
                        cu.sync.direction.y,
                        cu.fireInfo.speed);
                    unit.sync.status = "move";
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
        }
        if (cu.player.game.simuFrame % 1 == 0) {
            //simuai
        }
    },

    setCompensate: function (cu) {
        var difpos = cu.simu.pos.clone().sub(cu.show.pos).length();
        cu.show.speed = cu.sync.speed + Math.sign(cu.sync.speed) * difpos * 10;
    },

    show1f: function (cu) {
        if (cu.sync.status == "move") {
            var ret = util.moveTo(cu.show.pos, cu.simu.pos, cu.show.speed, config.frameInterval);
            cu.show.pos = ret[0];
            var reach = ret[1];
            if (reach) {
                cu.show.speed = cu.sync.speed;
            }
        }
    },

    onSimuCollide: function (cu, collider) {
    },

    update: function (cu) {
        cu.sprite.position.x = cu.show.pos.x;
        cu.sprite.position.y = cu.show.pos.y;
        //Sprite.update(cu.sprite);
    },
};
