$(function () {
    initScene("WebGLoutput");
    initEvent();
    makeLine(0, 0, 100, 100, 0xff0000, true);
    makeHexagon(-100, 100, 50, 0x00ff00, true);
    UpdateHandles.addHandle(function () {
        if (global.event.keydown) {
            console.log("key down", global.event.key);
        }
        if (global.event.mouseKeyDown) {
            console.log("mouse down", global.event.mousePos);
        }
    });
});
