function GameUnit(x, y, scene) {
    this.realState = {pos: new THREE.Vector3(x, y, 0), 
        vel: new THREE.Vector3(0, 30, 0)};
    this.showState = {pos: new THREE.Vector3(x, y, 0)};
    //this.lastUpdateTime = util.time();

    var sprite = util.newPlane(x, y, 10, 20, 0xff0000);
    var head = util.newPlane(0, 15, 10, 10, 0x00ff00);
    sprite.add(head);
    this.sprite = sprite;
    scene.add(this.sprite);

    GameUnit.prototype.update = function () {
        /*
        var time = util.time();
        var vel = this.realState.vel.clone();
        vel.multiplyScalar(time - this.lastUpdateTime);
        this.realState.pos.add(vel);
        */
        this.showState.pos.lerp(this.realState.pos, 0.9);
        this.sprite.position.x = this.showState.pos.x;
        this.sprite.position.y = this.showState.pos.y;
        //this.lastUpdateTime = time;
    };

    GameUnit.prototype.setRealPos = function (x, y) {
        this.realState.pos.x = x;
        this.realState.pos.y = y;
    };

    this.updateHandle = UpdateHandles.addMethodUpdate(this);
}
