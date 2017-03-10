$(function () {
    initCfg();
    initScene("WebGLoutput0");
    initEvent();
    initGrid();
    var game = Game.create();
    $("#nextFrame").click(function () {
        Game.nextFrame(game);
    });
});
