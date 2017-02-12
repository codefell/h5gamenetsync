function Client(divId, x, y, speed)
{
    this.divId = divId;
    this.lastUpdateTime = 0;
    this.netFrameIndex = 0;
    this.sceneInfo = initScene(divId);
    var je = $("#" + divId);
    var width = je.width();
    var height = je.height();
    this.width = width;
    this.height = height;
    this.hasStart = false;
    this.gu = new GameUnit(x, y, speed, this.sceneInfo.scene, this);
    this.startTime = 0;
    Client.allClient[divId] = this;

    Client.prototype.recvHandler = function (msg) {
        if (msg.type == "setTarget") {
            this.gu.sync(msg);
        }
    };

    Client.prototype.start = function () {
        this.hasStart = true;
        this.netFrameIndex = 0;
        this.startTime = util.time();
        this.lastUpdateTime = this.startTime;
    };

    Client.prototype.netUpdate =  function () {
        if (!this.hasStart) {
            return;
        }
        var time = util.time();
        while (this.lastUpdateTime + config.netFrameInterval < time) {
            this.netFrameIndex++;
            this.lastUpdateTime += config.netFrameInterval;
            this.handleNetFrame();
        }
    };

    Client.prototype.handleNetFrame = function () {
        this.gu.handleNetFrame(this.netFrameIndex);
    };

    Client.prototype.update = function () {
        this.netUpdate();
    };

    this.updateHandle = UpdateHandles.addMethodUpdate(this);

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
            x = -(client.width/2 - x);
            y = client.height/2 - y;
            client.conn.clientSend({type: "setTarget",
                target: new THREE.Vector3(x, y, 0)});
            });
}
Client.allClient = [];
