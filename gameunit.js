function GameUnit(x, y, speed, scene, client) {
    this.client = client;
    this.speed = speed;
    this.syncState = {pos: new THREE.Vector3(x, y, 0)};
    this.showState = {pos: new THREE.Vector3(x, y, 0)};
    this.target = new THREE.Vector3(x, y, 0);

    this.netFrameIndex = 0;
    this.syncNetFrameIndex = 0;

    var sprite = util.newPlane(x, y, 40, 40, 0xff0000);
    //var head = util.newPlane(0, 15, 10, 10, 0x00ff00);
    //sprite.add(head);
    this.sprite = sprite;
    scene.add(this.sprite);

    /*
    GameUnit.prototype.updateShowState = function () {
        this.showState.pos.lerp(this.realState.pos, 0.9);
        this.sprite.position.x = this.realState.pos.x;
        this.sprite.position.y = this.realState.pos.y;
    };
    */

    GameUnit.prototype.handleNetFrame = function (netFrameIndex) {
        this.netFrameIndex = netFrameIndex;
    };

    GameUnit.prototype.sync = function(msg) {
        var deltaTime = (msg.frameIndex - this.syncNetFrameIndex)
            * config.netFrameInterval;
        this.syncState.pos = util.move(this.syncState.pos,
                this.target, this.speed, deltaTime);
        this.target = msg.target.clone();
        console.log(this.showState.pos);
        this.showState.pos = this.syncState.pos.clone();
        console.log(this.showState.pos);
        this.syncNetFrameIndex = msg.frameIndex;
    };

    GameUnit.prototype.simulateShowState = function () {
        if (this.netFrameIndex <= this.syncNetFrameIndex) {
            return;
        }
        var dis = this.target.distanceTo(this.showState.pos);
        if (dis >= config.targetDelta) {
            var deltaTime = (UpdateHandles.time - this.client.startTime) 
                - this.syncNetFrameIndex * config.netFrameInterval;
            this.showState.pos = util.move(this.syncState.pos,
                this.target, this.speed, deltaTime);
        }
    };

    GameUnit.prototype.update = function () {
        this.simulateShowState();
        this.sprite.position.x = this.showState.pos.x;
        this.sprite.position.y = this.showState.pos.y;
        /*
        this.updateRealState();
        this.updateShowState();
        */
    };

    /*
    GameUnit.prototype.setRealPos = function (x, y) {
        this.realState.pos.x = x;
        this.realState.pos.y = y;
    };
    */

    this.updateHandle = UpdateHandles.addMethodUpdate(this);
}
