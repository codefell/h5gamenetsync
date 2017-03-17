var Sprite = {
    rightUvs: [[
        [{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 1}],
        [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}],
    ]],
    leftUvs: [[
        [{x: 1, y: 1}, {x: 1, y: 0}, {x: 0, y: 1}],
        [{x: 1, y: 0}, {x: 0, y: 0}, {x: 0, y: 1}],
    ]],
    setBlood: function (sprite, blood) {
        sprite.bloodbar.scale.x = blood;
    },
    setAni: function (sprite, status) {
        if (sprite.currAniName != status) {
            sprite.currAniName = status;
            sprite.aniList[status].frame = 0;
        }
    },
    create: function (x, y, w, h, name, aniInfoList, left) {
        var planeGeometry = new THREE.PlaneGeometry(w, h);
        var planeMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
        });
        var bloodbarbg = util.newPlane(0, -40, 0, 60, 10, 0x0000ff);
        var bloodbar = util.newPlane(0, 0, 1, 56, 6, 0xff0000);
        bloodbarbg.add(bloodbar);
        var plane = new THREE.Mesh(planeGeometry, planeMaterial);
        if (left) {
            planeGeometry.faceVertexUvs = Sprite.leftUvs;
        }
        else {
            planeGeometry.faceVertexUvs = Sprite.rightUvs;
        }
        plane.add(bloodbarbg);
        bloodbar.scale.x = 0.5;
        planeGeometry.uvsNeedUpdate = true;
        plane.position.x = x;
        plane.position.y = y;
        plane.position.z = 0;
        var sprite = {
            bloodbar: bloodbar,
            plane: plane,
            name: name,
            aniList: {},
            currAniName: "idle",
        };
        for (var i in aniInfoList) {
            var aniInfo = aniInfoList[i];
            var aniName = aniInfo.name;
            var aniNum = aniInfo.num;
            var loop = aniInfo.loop;
            var path = "image/" + name + "/" + aniName;
            sprite.aniList[aniName] = 
                Animation.create(sprite, path, aniNum, loop);
        }
        //sprite.plane.material.map = sprite.aniList["idle"].frameList[0];
        Animation.update(sprite.aniList[sprite.currAniName]);
        return sprite;
    },
    update: function (sprite) {
        Animation.update(sprite.aniList[sprite.currAniName]);
    },
};

var Animation = {
    create: function (sprite, path, texNum, loop) {
        var ani = {
            sprite: sprite,
            frameList: [],
            frame: 0,
            loop: loop,
        };
        for (var i = 0; i < texNum; i++) {
            var tex = THREE.ImageUtils.loadTexture(path + "/" + i + ".png");
            ani.frameList.push(tex);
        }
        return ani;
    },
    update: function (ani) {
        ani.frame++;
        if (ani.frame >= ani.frameList.length * 5) {
            if (ani.loop) {
                ani.frame = 0;
            }
            else {
                ani.frame--;
            }
        }
        var frame = Math.floor(ani.frame / 5);
        //console.log(ani.frameList[frame]);
        if (ani.sprite.plane.material.map != ani.frameList[frame]) {
            ani.sprite.plane.material.map = ani.frameList[frame];
        }
    },
};
