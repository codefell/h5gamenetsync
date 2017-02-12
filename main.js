$(function () {
    //initScene("WebGLoutput0");
    //initScene("WebGLoutput1");
    //initEvent();
    server.init(0, 0, 40);
    var client0 = new Client("WebGLoutput0", 0, 0, 40);
    var client1 = new Client("WebGLoutput1", 0, 0, 40);
    client0.start();
    client1.start();
});
