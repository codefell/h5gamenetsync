function GameUnit(x, y, speed, scene, client) {
    this.client = client;
    this.speed = speed;
    this.syncState = {pos: new THREE.Vector3(x, y, 0)};
    this.simuState = {pos: new THREE.Vector3(x, y, 0)};
    this.showState = {pos: new THREE.Vector3(x, y, 0)};
    this.target = new THREE.Vector3(x, y, 0);

    this.showCpPos = new THREE.Vector3();
    this.showCpStart = 0;
    this.showCpLast = 0;

    this.netFrameIndex = 0;
    this.syncNetFrameIndex = 0;

    var sprite = util.newPlane(x, y, 20, 20, 0xff0000);
    //var head = util.newPlane(0, 15, 10, 10, 0x00ff00);
    //sprite.add(head);
    this.sprite = sprite;
    scene.add(this.sprite);

    GameUnit.prototype.handleNetFrame = function (netFrameIndex) {
        this.netFrameIndex = netFrameIndex;
    };

    GameUnit.prototype.sync = function(msg) {
        var deltaTime = (msg.frameIndex - this.syncNetFrameIndex)
            * config.netFrameInterval;
        this.syncState.pos = util.move(this.syncState.pos,
                this.target, this.speed, deltaTime);
        this.target = msg.target.clone();

        //this.showState.pos = this.syncState.pos.clone();
        deltaTime = (UpdateHandles.time - this.client.startTime) 
            - msg.frameIndex * config.netFrameInterval;
        this.simuState.pos = util.move(this.syncState.pos,
            this.target, this.speed, deltaTime);
        //compensate showDelta in 2 frame
        this.showCpPos.copy(this.simuState.pos).sub(this.showState.pos);
        this.showCpStart = UpdateHandles.time;
        this.showCpLast = this.showCpStart;

        this.syncNetFrameIndex = msg.frameIndex;
    };

    GameUnit.prototype.simulate = function () {
        var oldSimuPos = this.simuState.pos.clone();
        var dis = this.target.distanceTo(this.simuState.pos);
        if (dis >= config.targetDelta) {
            var deltaTime = (UpdateHandles.time - this.client.startTime) 
                - this.syncNetFrameIndex * config.netFrameInterval;
            this.simuState.pos = util.move(this.syncState.pos,
                this.target, this.speed, deltaTime);
        }
        return this.simuState.pos.clone().sub(oldSimuPos);
    };

    GameUnit.prototype.update = function () {
        var translate = this.simulate();
        this.showState.pos.add(translate);
        var cpHead = Math.min(UpdateHandles.time, 
            this.showCpStart + 2 * config.netFrameInterval);
        var cpAlpha = (cpHead - this.showCpLast)
            / (2 * config.netFrameInterval);
        var cpPos = this.showCpPos.clone().multiplyScalar(cpAlpha);
        this.showState.pos.add(cpPos);
        this.showCpLast = cpHead;
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
