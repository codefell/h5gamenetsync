$(function () {
    initScene("WebGLoutput");
    initEvent();
    global.ox = -global.width / 2 + 10;
    global.oy = global.height / 2 - 10;
    global.hr = 40;
    var row = 7;
    var col = 8;
    for (var i = 0; i < row; i++) {
        var n = (i % 2 == 0) ? col : col - 1;
        for (var j = 0; j < n; j++) {
            drawHexagon(i, j);
        }
    }

    UpdateHandles.addHandle(function () {
        if (global.event.keydown) {
            console.log("key down", global.event.key);
        }
        if (global.event.mouseKeyDown) {
            console.log("mouse down", global.event.mousePos);
        }
    });
});
