$(function () {

    $("#action").click(function () {
        Client.opTest(client0);
        console.log("action");
        Client.opTest(client1);
    });
    $("#next").click(function () {
        UpdateHandles.update();
    });

    $(document).keydown(function (e) {
        var key = String.fromCharCode(e.which);
        if (key == "C") {
            console.log("client0");
            var unit0 = client0.game.players.list[0].units.list[0];
            var unit1 = client0.game.players.list[1].units.list[0];
            console.log("unit0", unit0.sync.pos, unit0.simu.pos, unit0.show.pos);
            console.log("unit1", unit1.sync.pos, unit1.simu.pos, unit1.show.pos);

            console.log("client1");
            var unit0 = client1.game.players.list[0].units.list[0];
            var unit1 = client1.game.players.list[1].units.list[0];
            console.log("unit0", unit0.sync.pos, unit0.simu.pos, unit0.show.pos);
            console.log("unit1", unit1.sync.pos, unit1.simu.pos, unit1.show.pos);
        }
        else if (key == "E") {
            console.log("server eval");
            var server = Server.getInst();
            Server.eval(server);
        }
        else if (key == "S") {
            var server = Server.getInst();
            for (var i in server.players.list) {
                var unit = server.players.list[i].units.list[0];
                console.log("server unit", unit.id, unit.pos);
            }
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
            x: 59,
            y: 0,
            speed: 30,
            dx: -1,
            dy: 0,
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
            x: 0,
            y: 0,
            speed: 30,
            dx: 1,
            dy: 0,
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
