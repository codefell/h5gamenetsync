function overlap(c0, c1) {
    var r2 = c0.r + c1.r;
    var dis = new THREE.Vector2(c0.x - c1.x, c0.y - c1.y).length();
    return dis < r2;
}

$(function () {
    initScene("WebGLoutput");
    initEvent();
    var circle0 = makeCircle(-80, 20, 100, 0xff0000);
    var circle1 = makeCircle(100, 40, 60, 0xff00ff);
    var circle = makeCircle(100, -100, 80, 0x00ff00);
    circle.lx = circle.x;
    circle.ly = circle.y;

    $(document).keydown(function (e) {
        var key = String.fromCharCode(e.which);
        if (key == "K") {
            var ol = function () {
                return (overlap(circle, circle0)
                    || overlap(circle, circle1));
            };
            if (ol()) {
                var s = new THREE.Vector2(circle.lx, circle.ly);
                var e = new THREE.Vector2(circle.x, circle.y);
                for (var i = 0; i < 10; i++) {
                    var m = s.clone().add(e).divideScalar(2);
                    circle.x = m.x;
                    circle.y = m.y;
                    if (ol()) {
                        e = m;
                    }
                    else {
                        s = m;
                    }
                }
                circle.x = m.x;
                circle.y = m.y;
                circle.lx = m.x;
                circle.lx = m.y;
                circle.sprite.position.x = m.x;
                circle.sprite.position.y = m.y;
            }
        }
    });
    $("#WebGLoutput").click(function (e) {
        var rect = $("#WebGLoutput")[0].getBoundingClientRect();
        var x = Math.floor(e.clientX - rect.left);
        var y = Math.floor(e.clientY - rect.top);
        x = -(global.width /2 - x);
        y = global.height / 2- y;
        circle.lx = circle.x;
        circle.ly = circle.y;
        circle.x = x;
        circle.y = y;
        circle.sprite.position.x = x;
        circle.sprite.position.y = y;
    });
});
