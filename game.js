var Game = {
    create: function () {
        return {
            clientFrame: 0,
            syncFrame: 0,
            simuFrame: 0,
            sync: {
                pos: 0,
                speed: 30,
                unit: newUnit(0, 0, 0x00ff00),
            },
            simu: {
                pos: 0,
                unit: newUnit(0, -1, 0xff0000),
            },
            show: {
                pos: 0,
                unit: newUnit(0, -2, 0x0000ff),
            },
            cpPos: 0,
            cpStartFrame: 0,
            cpLastFrame: 0,
            syncInfo: [],
        };
    },
    toString: function (game) {
        return "syncF: " + game.syncFrame
            + ", simuF: " + game.simuFrame 
            + ", syncPos: " + game.sync.pos
            + ", simuPos: " + game.simu.pos
            + ", showPos: " + game.show.pos
            + ", cpPos: " + game.cpPos
            + ", cpStartF: " + game.cpStartFrame
            + ", cpLastF: " + game.cpLastFrame;
    },
    sync: function (game, syncFrame) {
        game.syncInfo.push({syncFrame: syncFrame});
    },
    sync1f: function (game) {
        game.sync.pos += game.sync.speed / 60;
        game.simu.pos = game.sync.pos;
    },
    setCp: function (game) {
        game.cpPos = game.simu.pos - game.show.pos;
        game.cpStartFrame = game.clientFrame;
        game.cpLastFrame = game.clientFrame;
    },
    simu1f: function (game) {
        game.simu.pos += game.sync.speed / 60;
    },
    updateState: function (game) {
        //first simu for this frame, then deal with new syncinfo
        var deltaSimuFrame = game.clientFrame - game.simuFrame;
        var oldSimuPos = game.simu.pos;
        for (var i = 0; i < deltaSimuFrame; i++) {
            Game.simu1f(game);
        }
        var deltaSimuPos = game.simu.pos - oldSimuPos;
        game.show.pos += deltaSimuPos;
        var cpHead = Math.min(
                game.cpStartFrame + 6,
                game.clientFrame);
        var cpAlpha = (cpHead - game.cpLastFrame) / 6;
        game.cpLastFrame = cpHead;
        var cpPos = game.cpPos * cpAlpha;
        game.show.pos += cpPos;
        game.simuFrame = game.clientFrame;

        if (game.syncInfo.length > 0) {
            //game.syncinfo should be sorted by syncFrame
            for (var i in game.syncInfo) {
                var syncInfo = game.syncInfo[i];
                var deltaSyncFrame = syncInfo.syncFrame - game.syncFrame;
                for (var i = 0; i < deltaSyncFrame; i++) {
                    Game.sync1f(game);
                }
                game.syncFrame = syncInfo.syncFrame;
                //set game.syncinfo state to game unit
            }
            //limit simu frame num, (simuFrame - syncFrame) < limitFrameNum
            //wait for new syncinfo
            var deltaSimuFrame = game.clientFrame - game.syncFrame;
            for (var i = 0; i < deltaSimuFrame; i++) {
                Game.simu1f(game);
            }
            game.simuFrame = game.clientFrame;
            Game.setCp(game);
            game.syncInfo = [];
        }
    },

    updateSprite: function(game) {
        game.sync.unit.position.x = gridX(game.sync.pos);
        game.simu.unit.position.x = gridX(game.simu.pos);
        game.show.unit.position.x = gridX(game.show.pos);
    },

    updateUI: function (game) {
        $("#frameNum").text(game.clientFrame);
        $("#gameInfo").text(Game.toString(game));
    },

    nextFrame: function (game) {
        game.clientFrame++;
        Game.updateState(game);
        Game.updateSprite(game);
        Game.updateUI(game);
    },
};
