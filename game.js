var Game = {
    create: function () {
        return {
            clientFrame: 0,
            syncFrame: 0,
            sync: {
                pos: 0,
                speed: 20,
                unit: newUnit(0, 0, 0x00ff00),
            },
            simu: {
                pos: 0,
                unit: newUnit(0, -1, 0xff0000),
            },
            show: {
                pos: 0,
                unit: newUnit(0, -2, 0x0000ff),
            }
        };
    },
    nextFrame: function (game) {
        game.clientFrame++;
        $("#frameNum").text(game.clientFrame);
        game.show.pos += game.sync.speed / 60;
        Game.update(game);
    },
    update: function (game) {
        console.log(game);
        game.sync.unit.position.x = gridX(game.sync.pos);
        game.simu.unit.position.x = gridX(game.simu.pos);
        game.show.unit.position.x = gridX(game.show.pos);
    },
};
