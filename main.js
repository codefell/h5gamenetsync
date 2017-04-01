$(function () {
    initScene("WebGLoutput");
    initEvent();
    UpdateHandles.addHandle(function () {
        if (global.event.keydown) {
            console.log("key down", global.event.key);
        }
        if (global.event.mouseKeyDown) {
            console.log("mouse down", global.event.mousePos);
        }
    });
});
