var ClientGame {
    create: function () {
        //syncTime = startTime + syncFrame * config.frameInterval
        syncFrame: 0,
        startTime: 0,
        showCpStart: 0,
        showCpLast: 0,
        players: MapList.create();
    },

    sync: function (cg, syncFrame) {
        var syncDeltaFrame = syncFrame - cg.syncFrame;
        var simuDeltaFrame = Math.floor(
            (UpdateHandles.time - cg.startTime)
            / confgi.frameInterval) - syncFrame;
        cg.showCpStart = UpdateHandles.time;
        cg.showCpLast = cg.showCpStart;
        cg.players.call(cg.players, ClientPlayer.sync,
            syncDeltaFrame, simuDeltaFrame);
    },

    follow: function (cg) {
        var cpHead = Math.min(UpdateHandles.time, 
            this.show.cpStart + 100);
        var cpAlpha = (cpHead - this.show.cpLast) / 100;
        cg.players.call(cg.players, ClientPlayer.follow, cpAlpha);
        this.show.cpLast = cpHead;
    },

    update: function (cg) {
        ClientGame.follow(cg);
        cg.players.call(cg.players, ClientPlayer.update);
    },
};

var ClientPlayer {
    create: function () {
        return {
            units: MapList.create();
        };
    },
    sync: function (cp, syncDeltaFrame, simuDeltaFrame) {
        cp.units.call(cp.units, ClientUnit.sync, syncDeltaFrame, 
            simuDeltaFrame);
    },
    follow: function (cp, cpAlpha) {
        cp.units.call(cp.units, ClientUnit.follow, cpAlpha);
    },
    update: function (cp) {
        cp.units.call(cp.units, ClientUnit.update);
    },
};

var ClientUnit {
    create: function () {
        return {
            sync: {
                this.pos = new THREE.Vector3(),
                this.target = new THREE.Vector3(),
                this.speed = 0,
            },
            simu: {
                pos: new THREE.Vector3(),
            },
            show: {
                pos: new THREE.Vector3(),
                cpPos: new THREE.Vector3(),
            },
        };
    },

    sync: function (cu, syncDeltaFrame, simuDeltaFrame) {
        var deltaTime = syncDeltaFrame * config.frameInterval;
        this.pos = util.move(cu.sync.pos,
                cu.sync.target, cu.sync.speed, deltaTime);
        ClientUnit.simu(cu, simuDeltaFrame);
        ClientUnit.setCompensate(cu);
    },

    setCompensate: function (cu) {
        cu.show.cpPos.copy(cu.simu.pos).sub(cu.show.pos);
    },

    simu: function (cu, deltaFrame) {
        var oldSimuPos = cu.simu.pos.clone();
        var dis = cu.sync.target.distanceTo(cu.simu.pos);
        if (dis >= config.targetDelta) {
            var deltaTime = deltaFrame * config.frameInterval;
            cu.simu.pos = util.move(cu.sync.pos,
                cu.sync.target, cu.speed, deltaTime);
        }
        return cu.simu.pos.clone().sub(oldSimuPos);
    },

    follow: function (cu, cpAlpha) {
        var translate = cu.simu();
        cu.show.pos.add(translate);
        var cpPos = cu.show.cpPos.clone().multiplyScalar(cpAlpha);
        cu.show.pos.add(cpPos);
    },

    update: function (cu) {
        cu.sprite.position.x = cu.show.pos.x;
        cu.sprite.position.y = cu.show.pos.y;
    },
};
