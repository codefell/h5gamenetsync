$(function () {

    $("#action").click(function () {
        Client.opTest(client0);
        console.log("action");
        //Client.opTest(client1);
    });
    $("#next").click(function () {
        UpdateHandles.update();
        var unit00 = client0.game.players.list[0].units.list[0];
        //var unit01 = client0.game.players.list[1].units.list[0];
    });

    $(document).keydown(function (e) {
        var key = String.fromCharCode(e.which);
        if (key == "I") {
            var unit00 = client0.game.players.list[0].units.list[0];
            var unit01 = client0.game.players.list[1].units.list[0];
            console.log("client 0 sync", client0.game.syncFrame, "simu", client0.game.simuFrame);
            console.log("unit0 sync", unit00.sync.pos, "simu", unit00.simu.pos, "show", unit00.show.pos);
            /*
            console.log("unit1", unit01.sync.pos, unit01.simu.pos, unit01.show.pos);
            var unit10 = client1.game.players.list[0].units.list[0];
            var unit11 = client1.game.players.list[1].units.list[0];
            console.log("client 1", client1.game.syncFrame, client1.game.simuFrame);
            console.log("unit0", unit10.sync.pos, unit10.simu.pos, unit10.show.pos);
            console.log("unit1", unit11.sync.pos, unit11.simu.pos, unit11.show.pos);
            */
        }
        else if (key == "E") {
            Server.eval(Server.getInst());
        }
        else if (key == "S") {
            console.log("server", Server.getInst().syncFrame, Server.getInst().players.list[0].units.list[0].pos);
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
    console.log(Math);
});
