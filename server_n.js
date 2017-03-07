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
    onOp: function (sg, conn, msg) {
        var deltaFrame = Math.floor(
            (UpdateHandles.time - sg.startTime)
            / config.frameInterval);
        ServerGame.eval(sg, deltaFrame);
    },
    eval: function (sg, deltaFrame) {
        for (var i = 0; i < deltaFrame; i++) {
            evalOneFrame();
            sg.syncFrame++;
        }
    },
    evalOneFrame: function () {
        evalPos();
    },
    evalPos: function () {

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
