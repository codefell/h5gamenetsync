$(function () {
    //initScene("WebGLoutput0");
    //initScene("WebGLoutput1");
    //initEvent();
    server.init(0, 0, 40);
    var client0 = new Client("WebGLoutput0", 0, 0, 90);
    var client1 = new Client("WebGLoutput1", 0, 0, 90);
    client0.start();
    client1.start();

    $(document).keydown(function (e) {
        var key = String.fromCharCode(e.which);
        if (key == "I") {
            for (var i in Client.allClient) {
                var client = Client.allClient[i];
                client.info();
            }
        }
    });
});
