$(function () {
    var wsServer = 'ws://localhost:8000';
    window.websocket = new WebSocket(wsServer); 
    websocket.onopen = function (evt) { onOpen(evt) }; 
    websocket.onclose = function (evt) { onClose(evt) }; 
    websocket.onmessage = function (evt) { onMessage(evt) }; 
    websocket.onerror = function (evt) { onError(evt) }; 
    function onOpen(evt) { 
        console.log("Connected to WebSocket server."); 
    } 
    function onClose(evt) { 
        console.log("Disconnected"); 
    } 
    function onMessage(evt) { 
        console.log('Retrieved data from server: ' + evt.data); 
    } 
    function onError(evt) { 
        console.log('Error occured: ' + evt); 
    }
    return;

    $("#action").click(function () {
        Client.opTest(client0);
        Client.opTest(client1);
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
            for (var i in Client.allClient) {
                var client = Client.allClient[i];
                console.log("client", client.divId, client.game.syncFrame);
                for (var j in client.game.players.list) {
                    var player = client.game.players.list[j];
                    console.log("player", player.id);
                    for (var k in player.units.list) {
                        var unit = player.units.list[k];
                        console.log("unit", unit.id,
                            JSON.stringify(unit.sync.pos),
                            JSON.stringify(unit.simu.pos),
                            JSON.stringify(unit.show.pos));
                    }
                }
            }
            var server = Server.getInst();
            Server.eval(server);
            console.log("server", server.syncFrame);
            for (var i in server.players.list) {
                var player = server.players.list[i];
                console.log("player", player.id);
                for (var k in player.units.list) {
                    var unit = player.units.list[k];
                    console.log("unit", unit.id, JSON.stringify(unit.pos));
                }
            }
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
            speed: 30,
            dx: 1,
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
            x: 20,
            y: -20,
            speed: 30,
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
