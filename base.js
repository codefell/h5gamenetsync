var MapList {
    create: function () {
        return {
            list: [],
            map: {}
        };
    },
    add: function (ml, e) {
        for (var i in ml.list) {
            if (ml.list[i] == undefined) {
                ml.list[i] = e;
                return;
            }
        }
        ml.list.push(e);
        ml.map[e.id] = e;
    },
    del: function (ml, e) {
        for (var i in ml.list) {
            if (ml.list[i] == e) {
                ml.list[i] = undefined;
                return;
            }
        }
        ml.map[e.id] = undefined;
    },
    get: function (ml, id) {
        return ml[id];
    },
    call: function (ml, fn) {
        var args = arguments.slice(2);
        args.unshift(null);
        for (var i in ml.list) {
            if (ml.list[i]) {
                args[0] = ml.list[i];
                fn.apply(undefined, args);
            }
        }
    },
}

function GameBase() {
    this.playerList = [];
    this.playerMap = {};
    this.syncTime = 0;
    GameBase.prototype.start = function () {
        this.syncTime = UpdateHandles.time;
    };
    GameBase.prototype.addPlayer = function (player) {
        util.array.add(this.playerList, player);
        this.playerMap[player.id] = player;
    };
    GameBase.prototype.delPlayer = function (player) {
        util.array.del(this.playerList, player);
        this.playerMap[player.id] = null;
    };
    GameBase.prototype.getPlayer = function (playerId) {
        return this.playerMap[playerId];
    };
    GameBase.prototype.eval = function (toTime) {
        var deltaTime = toTime - this.syncTime;
        for (var i in this.playerList) {
            var player = this.playerList[i];
            player.eval(deltaTime);
        }
    };
}

function PlayerBase() {
    this.unitList = [];
    this.unitMap = {};
    PlayerBase.prototype.addUnit = function (unit) {
        util.array.add(this.unitList, unit);
        this.unitMap[unit.id] = unit;
    };
    PlayerBase.prototype.delUnit = function (unit) {
        util.array.del(this.unitList, unit);
        this.unitMap[unit.id] = null;
    };
    PlayerBase.prototype.getUnit = function (unitId) {
        return this.unitMap[unit.id];
    };
    PlayerBase.prototype.eval = function (deltaTime) {
        for (var i in this.unitList) {
            var unit = this.unitList[i];
            unit.eval(deltaTime);
        }
    };
}

var Unit {
    UnitBase.prototype.init = function (initStatus) {
        this.pos = initStatus.pos;
        this.target = initStatus.target;
        this.speed = initStatus.speed;
    };
    UnitBase.prototype.eval = function (deltaTime) {
        this.pos = util.move(this.pos,
                this.target, this.speed, deltaTime);
    };
}
