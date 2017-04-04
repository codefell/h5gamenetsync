function drawHexagonMap() {
    global.ox = -global.width / 2 + 10;
    global.oy = global.height / 2 - 10;
    global.hr = 40;
    var row = 7;
    var col = 8;
    for (var i = 0; i < row; i++) {
        var n = (i % 2 == 0) ? col : col - 1;
        for (var j = 0; j < n; j++) {
            drawGridHexagon(i, j);
        }
    }
}

function drawHexagon(x, y, r, color, addToScene) {
    var geometry = new THREE.Geometry();
    var stepAngle = Math.PI * 2 / 6;
    for (var i = 0; i < 6; i++) {
        var angle = i * stepAngle;
        geometry.vertices.push(new THREE.Vector3(r * Math.cos(angle),
            r * Math.sin(angle), 0));
    }
    geometry.vertices.push(new THREE.Vector3(r, 0, 0));
    var material = new THREE.LineBasicMaterial({color: color});
    var hexagon = new THREE.Line(geometry, material);
    hexagon.position.x = x;
    hexagon.position.y = y;
    if (addToScene) {
        global.scene.add(hexagon);
    }
    return hexagon;
}

function drawGridHexagon(hx, hy) {
    var ox = global.ox;
    var oy = global.oy;
    var r = global.hr;
    var x = ox + hx * 1.5 * r + r; 
    var y = oy - hy * Math.sqrt(3) * r - Math.sqrt(3) / 2 * r;
    if (hx % 2 == 1) {
        y -= Math.sqrt(3) / 2 * r;
    }
    drawHexagon(x, y, r, 0xff0000, true);
}
