var ServerGame = {
    create: function () {
        return {
            players: MapList.create(),
            syncFrame: 0,
            startTime: 0,
        };
    },
    onLogin: function (sg, conn, msg) {
        sg.players.add(ServerPlayer.create(conn));
    },
    onReady: function (sg, conn, msg) {
        ServerPlayer.setPlayerInfo(sg.players.get(conn.id),
            msg.playerInfo);
        if (all player ready) {
            start
            ServerGame.sendMsg(sg, {
                type: 'start',
                time: UpdateHandles.time,
            });
        }
    },
    sendMsg: function (sg, msg) {

    },
    onOp: function (sg, conn, msg) {
        var deltaFrame = Math.floor(
            (UpdateHandles.time - sg.startTime)
            / config.frameInterval);
        ServerGame.sync(sg, deltaFrame);
        set current state to player and unit
        set should send state = true
    },
    sync: function (sg, deltaFrame) {
        for (var i = 0; i < deltaFrame; i++) {
            MapList.call(sg.players, ServerPlayer.sync1f);
            sg.syncFrame++;
        }
    },
    update: function (sg) {
        if (should send state == false) {
            should send state == should ping state
        }
        if (should send state) {
            send current state to all player
        }
    },
};

var ServerPlayer = {
    create: function (conn) {
        return {
            id: conn.id,
            conn: conn,
            units: MapList.create(),
        };
    },
    setPlayerInfo: function (sp, playerInfo) {
        dp.units.add units
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
    sync1f: function () {
        this.pos = util.move(cu.sync.pos,
            cu.sync.target, cu.sync.speed, config.frameInterval);
    },
};
