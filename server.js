function ServerGameUnit(x, y, speed) {
    this.pos = new THREE.Vector3(x, y, 0);
    this.speed =  speed;
    this.target = new THREE.Vector3(x, y, 0);

    ServerGameUnit.prototype.setTarget = function(target) {
        if (this.target.distanceTo(target) < config.targetDelta) {
            return;
        }
        this.target = target.clone();
    };

    ServerGameUnit.prototype.updatePos = function () {
        var dis = this.pos.distanceTo(this.target);
        if (dis >= config.targetDelta)
        {
            this.pos = util.move(this.pos,
                this.target, this.speed, UpdateHandles.deltaTime);
        }
    };

    ServerGameUnit.prototype.update = function () {
        this.updatePos();
    }

    this.updateHandle = UpdateHandles.addMethodUpdate(this);
}

var server = {
    lastNetUpdateTime: 0,
    netFrameIndex: 0,
    allConn: [],
    hasStart: false,
    gu: null,
    init: function(x, y, speed) {
        server.gu = new ServerGameUnit(x, y, speed);
        server.start();
    },
    start: function () {
        server.lastNetUpdateTime = util.time();
        server.netFrameIndex = 0; 
        server.handleNetFrame();
        server.hasStart = true;
    },
    sendMsg: function(msg) {
        for (var i in server.allConn) {
            var conn = server.allConn[i];
            conn.serverSend(msg);
        }
    },
    handleNetFrame: function () {
    },
    update: function () {
        if (!server.hasStart) {
            return;
        }
        while (server.lastNetUpdateTime + config.netFrameInterval < 
                UpdateHandles.time) {
            server.netFrameIndex++;
            server.lastNetUpdateTime += config.netFrameInterval;
            server.handleNetFrame();
        }
    },
    addConn: function (conn) {
        server.allConn.push(conn);
    },
    recvHandler: function (msg) {
        if (msg.type == "setTarget") {
            server.gu.setTarget(msg.target);
            var response = {
                'frameIndex': server.netFrameIndex,
                'type': "setTarget",
                'target': server.gu.target,
            };
            server.sendMsg(response);
        }
    },
};

$(function () {
    UpdateHandles.addMethodUpdate(server);
});
