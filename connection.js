function Connection(id, frameRate, frameRateFloat, serverRecvHandler, clientRecvHandler) {
    this.id = id;
    this.clientSendBuf = [];
    this.clientRecvBuf = [];
    this.frameRate = frameRate;
    this.frameRateFloat = frameRateFloat;
    this.serverRecvHandler = serverRecvHandler;
    this.clientRecvHandler = clientRecvHandler;

    Connection.prototype.handleTime = function () {
        return (UpdateHandles.time + this.frameRate - this.frameRateFloat + Math.random() * 2 * this.frameRateFloat);
    };

    Connection.prototype.clientSend = function (msg) {
        msg = JSON.parse(JSON.stringify(msg));
        this.clientSendBuf.push({'handleTimestamp': this.handleTime(), 'msg': msg});
    };

    Connection.prototype.serverSend = function (msg) {
        msg = JSON.parse(JSON.stringify(msg));
        this.clientRecvBuf.push({'handleTimestamp': this.handleTime(), 'msg': msg});
    };

    Connection.prototype.update = function () {
        while (this.clientSendBuf.length > 0) {
            var handleTimestamp = this.clientSendBuf[0].handleTimestamp;
            var msg = this.clientSendBuf[0].msg;
            if (handleTimestamp > UpdateHandles.time) {
                break;
            }
            this.serverRecvHandler(this, msg);
            this.clientSendBuf.shift();
        }
        while (this.clientRecvBuf.length > 0) {
            var handleTimestamp = this.clientRecvBuf[0].handleTimestamp;
            var msg = this.clientRecvBuf[0].msg;
            if (handleTimestamp > UpdateHandles.time) {
                break;
            }
            this.clientRecvHandler(msg);
            this.clientRecvBuf.shift();
        }
    };

    this.updateHandle = UpdateHandles.addMethodUpdate(this);
}
