$(function () {
    /*
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
    */
    console.log(UpdateHandles.addUpdateM);
    console.log(UpdateHandles.addUpdate);
    var server = Server.getInst();
    var serverUpdateHandle = 
        UpdateHandles.addUpdate(Server.update, server);
    var client0 = Client.create("WebGLoutput0", 0xFF0000);
    var client1 = Client.create("WebGLoutput1", 0x00FF00);
    Client.addLocalUnits(client0, [
        {
            x: 20,
            y: 20,
            speed: 35,
        },
        {
            x: 40,
            y: 40,
            speed: 35,
        },
    ]);
    Client.addLocalUnits(client1, [
        {
            x: -20,
            y: -20,
            speed: 35,
        },
        {
            x: -40,
            y: -40,
            speed: 35,
        },
    ]);
    /*
    Client.login(client0);
    Client.login(client1);
    Client.ready(client0);
    Client.ready(client1);
    */
});
