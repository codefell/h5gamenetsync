function GameUnit(x, y, color) {
    this.realState = {pos: new THREE.Vector2(x, y), vel: new THREE.Vector2()};
    this.showState = {pos: new THREE.Vector2(x, y)};
    this.sprite = util.newPlane(x, y, color);

    GameUnit.prototype.update = function () {
        this.showState.pos.lerp(this.realState.pos, 0.9);
        this.sprite.position.x = this.showState.pos.x;
        this.sprite.position.y = this.showState.pos.y;
    };

    GameUnit.prototype.setRealPos = function (x, y) {
        this.realState.pos.x = x;
        this.realState.pos.y = y;
    };

    this.updateHandle = util.addMethodUpdate(this);
}
