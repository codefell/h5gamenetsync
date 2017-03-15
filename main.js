$(function () {

    $("#action").click(function () {
        Client.opTest(client0);
        Client.opTest(client1);
    });
    $("#next").click(function () {
       UpdateHandles.update();
    });

    $(document).keydown(function (e) {
        var key = String.fromCharCode(e.which);
        if (key == "I") {
            console.log(client0.game.players.list[0].units.list[0]);
            //console.log(client1.game.players.list[0].units.list);
        }
        else if (key == "E") {
            Server.eval(Server.getInst());
        }
        else if (key == "S") {
            console.log(Server.getInst().players);
        }
        else if (key == "F") {
            Client.opFire(client1);
        }
    });

    util.makeMeasure(60);
    var server = Server.getInst();
    var serverUpdateHandle = 
        UpdateHandles.addUpdate(Server.update, server);
    var client0 = Client.create("WebGLoutput0", 0xcccc7f);
    var client1 = Client.create("WebGLoutput1", 0x7fcccc);
    Client.addLocalUnits(client0, [
        {
            x: 0,
            y: 0,
            speed: 30,
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
            x: 59,
            y: 0,
            speed: -30,
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
