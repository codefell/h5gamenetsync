function drawRect(x, y, size, color, addToScene) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(size / 2,
        size / 2, 0));
    geometry.vertices.push(new THREE.Vector3(-size / 2,
        size / 2, 0));
    geometry.vertices.push(new THREE.Vector3(-size / 2,
        -size / 2, 0));
    geometry.vertices.push(new THREE.Vector3(size / 2,
        -size / 2, 0));
    geometry.vertices.push(new THREE.Vector3(size / 2,
        size / 2, 0));
    var material = new THREE.LineBasicMaterial({color: color});
    var square = new THREE.Line(geometry, material);
    square.position.x = x;
    square.position.y = y;
    if (addToScene) {
        global.scene.add(square);
    }
    return square;
}

function drawSquareMap(row, col) {
    var width = global.width - 20;
    var size = width / col;
    var height = size * row;
    for (var i = 0; i < row; i++) {
        var y = height / 2 - i * size;
        for (var j = 0; j < col; j++) {
            x = -width / 2 + j * size;
            drawRect(x + size / 2, y - size / 2, size, 0xff0000, true);
            console.log(x + size / 2, y - size / 2);
        }
    }
}

