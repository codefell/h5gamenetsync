var Sprite = {
    create: function () {
    },
};

var Animation = {
    create: function (sprite, texFrameList) {
        var animation = {
            sprite: sprite,
            texFrameList: texFrameList,
        };
        for (var i in texFrameList) {
            var tex = texFrameList[i];
            new THREE.TextureLoader().load("image/idle.0.png",
                function (texture) {
                    mat.map = texture;
                });
        }
    },
};
