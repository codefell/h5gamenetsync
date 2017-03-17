$(function () {

    $("#action").click(function () {
        Client.opTest(client0);
    });

    $(document).keydown(function (e) {
        var key = String.fromCharCode(e.which);
        if (key == "T") {
            UpdateHandles.update();
        }
        else if (key == "S") {
            Client.opTestSpeed(Client.currOpClient);
        }
        else if (key == "I") {
            //console.log(client0.game.players.list[0].units.list[0]);
            //console.log(Server.getInst().players.list[0].units.list[0]);
            //console.log(client1.game.players.list[0].units.list[0]);
            //console.log(Server.getInst().players.list[1].units.list[0]);
        }
    });

    var server = Server.getInst();
    var serverUpdateHandle = 
        UpdateHandles.addUpdate(Server.update, server);
    var client0 = Client.create("WebGLoutput0", 0xcccc7f);
    var client1 = Client.create("WebGLoutput1", 0x7fcccc);
    Client.addLocalUnits(client0, [
        {
            x: 20,
            y: 20,
            speed: 35,
            dx: 0,
            dy: 1,
        },
        /*
        {
            x: -40,
            y: -40,
            speed: 35,
        },
        */
    ]);

    Client.addLocalUnits(client1, [
        {
            x: -20,
            y: 20,
            speed: 35,
            dx: 0,
            dy: 1,
        },
        /*
        {
            x: 40,
            y: -40,
            speed: 35,
        },
        */
    ]);
    Client.login(client0);
    Client.login(client1);
    Client.ready(client0);
    Client.ready(client1);
});
