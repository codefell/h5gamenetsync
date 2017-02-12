function Client(divId)
{
    this.divId = divId;
    this.sceneInfo = initScene(divId);
    var je = $("#" + divId);
    var width = je.width();
    var height = je.height();
    this.width = width;
    this.height = height;
    this.gu = new GameUnit(-width/2+ Math.random() * width, 
        -height/2 + Math.random() * height, this.sceneInfo.scene);
    Client.allClient[divId] = this;

    Client.prototype.recvHandler = function (msg) {
        this.gu.setRealPos(msg.x, msg.y);
    };

    this.conn = new Connection(this.divId, 0.1, 0.02, server.recvHandler,
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
            var client = Client.allClient[this.id];
            x = -(client.width - x);
            y = client.height - y;
            client.gu.setRealPos(x, y);
            client.conn.clientSend({clientId:client.divId,
                x: x,
                y: y});
            });
}
Client.allClient = [];
