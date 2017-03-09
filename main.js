$(function () {

    $(document).keydown(function (e) {
        var key = String.fromCharCode(e.which);
        if (key == "T") {
            UpdateHandles.update();
        }
    });

    var server = Server.getInst();
    /*
    var serverUpdateHandle = 
        UpdateHandles.addUpdate(Server.update, server);
        */
    var client0 = Client.create("WebGLoutput0", 0xcccccc);
    //var client1 = Client.create("WebGLoutput1", 0x00FF00);
    Client.addLocalUnits(client0, [
        {
            x: 20,
            y: 20,
            speed: 35,
        },
        /*
        {
            x: 40,
            y: 40,
            speed: 35,
        },
        */
    ]);
    Client.login(client0);
    /*
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
    */
    /*
    Client.login(client1);
    Client.ready(client0);
    Client.ready(client1);
    */
});
