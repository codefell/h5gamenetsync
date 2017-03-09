function Connection(name, frameRate, frameRateFloat, serverRecvHandler, clientRecvHandler) {
    this.name = name;
    this.clientSendBuf = [];
    this.clientRecvBuf = [];
    this.frameRate = frameRate;
    this.frameRateFloat = frameRateFloat;
    this.serverRecvHandler = serverRecvHandler;
    this.clientRecvHandler = clientRecvHandler;

    Connection.prototype.handleTime = function () {
        return (util.time() + this.frameRate - this.frameRateFloat + Math.random() * 2 * this.frameRateFloat);
    };

    Connection.prototype.clientSend = function (msg) {
        this.clientSendBuf.push({'handleTimestamp': this.handleTime(), 'msg': msg});
    };

    Connection.prototype.serverSend = function (msg) {
        this.clientRecvBuf.push({'handleTimestamp': this.handleTime(), 'msg': msg});
    };

    Connection.prototype.update = function () {
        while (this.clientSendBuf.length > 0) {
            var handleTimestamp = this.clientSendBuf[0].handleTimestamp;
            var msg = this.clientSendBuf[0].msg;
            if (handleTimestamp > util.time()) {
                break;
            }
            this.serverRecvHandler(this, msg);
            this.clientSendBuf.shift();
        }
        while (this.clientRecvBuf.length > 0) {
            var handleTimestamp = this.clientRecvBuf[0].handleTimestamp;
            var msg = this.clientRecvBuf[0].msg;
            if (handleTimestamp > util.time()) {
                break;
            }
            this.clientRecvHandler(msg);
            this.clientRecvBuf.shift();
        }
    };

    /*
    var thisObj = this;
    this.updateHandle = function () {
        var o = thisObj;
        return function () {
            o.update();
        }
    }();
    */
    this.updateHandle = UpdateHandles.addMethodUpdate(this);
}
