function Client(divId)
{
    this.divId = divId;
    this.sceneInfo = initScene(divId);
    this.gu = new GameUnit(-100 + Math.random() * 200, 
        -100 + Math.random() * 200, 0xFF0000, this.sceneInfo.scene);
    Client.allClient[divId] = this;

    Client.prototype.recvHandler = function (msg) {
        this.gu.setRealPos(msg.x, msg.y);
    };

    this.conn = new Connection(this.divId, 0, 0, server.recvHandler,
        function (o){
            return function (msg) {
                o.recvHandler(msg);
            };
        }(this));
    server.addConn(this.conn);

    $('#'+divId).click(function (e) {
            var rect0 = $(this)[0].getBoundingClientRect();
            var x = Math.floor(e.clientX - rect0.left);
            var y = Math.floor(e.clientY - rect0.top);
            x = -(100 - x);
            y = 100 - y;
            var client = Client.allClient[this.id];
            client.gu.setRealPos(x, y);
            client.conn.clientSend({clientId:client.divId,
                x: x,
                y: y});
            });
}
Client.allClient = [];
