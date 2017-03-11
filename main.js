$(function () {
    initCfg();
    initScene("WebGLoutput0");
    initEvent();
    initGrid();
    var game = Game.create();
    $("#nextFrame").click(function () {
        Game.nextFrame(game);
    });
    $("#syncFrame").click(function () {
        var frameNum = $("#syncFrameNum").val();
        Game.sync(game, frameNum);
    });
    console.log(Game.toString(game));
});
