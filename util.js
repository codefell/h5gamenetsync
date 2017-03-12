var util = {
    time: function() {
        return (new Date().getTime()) / 1000.0;
    },
    newPlane: function (x, y, w, h, color) {
        // create the ground plane
        var planeGeometry = new THREE.PlaneGeometry(w, h);
        var planeMaterial = new THREE.MeshBasicMaterial({color: color});
        var plane = new THREE.Mesh(planeGeometry, planeMaterial);

        // rotate and position the plane
        //plane.rotation.x = -0.5 * Math.PI;
        plane.position.x = x;
        plane.position.y = y;
        plane.position.z = 0;

        return plane;
    },
    move: function (pos0, pos1, speed, time) {
        var v = pos1.clone().sub(pos0);
        var dis = speed * time;
        if (dis > v.length()) {
            dis = v.length();
        }
        v.normalize().multiplyScalar(dis);
        return v.add(pos0);
    },
    array: {
        add: function (arr, e) {
            for (var i in arr) {
                if (arr[i] == null) {
                    arr[i] = e;
                    return;
                }
            }
            arr.push(e);
        },
        del: function (arr, e) {
            for (var i in arr) {
                if (arr[i] == e) {
                    arr[i] = null;
                    return;
                }
            }
        },
    },
    headCharUp: function(str) {
        if (str == null || str == "") {
            return str;
        }
        var head = str.charAt(0);
        head = head.toUpperCase();
        return head + str.slice(1);
    },
    arrCopy: function (arr) {
        var newArr = [];
        for (var i = 0; i < arr.length; i++) {
            newArr.push(arr[i]);
        }
        return newArr;
    },
    newLine: function (x0, y0, x1, y1, color) {
        var material = new THREE.LineBasicMaterial({ color: color});
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(x0, y0, 0));
        geometry.vertices.push(new THREE.Vector3(x1, y1, 0));
        var line = new THREE.Line(geometry, material);
        return line;
    },
    makeMeasure: function (num) {
        var je = $("#Measure");
        for (var i = 0; i < num; i++) {
            je.append("<div>" + i + "</div>");
        }
    },
    makeGrid: function(scene, gridSize, width, height) {
        for (var i = -width/2; i < width/2; i+= gridSize) {
            var line = util.newLine(i, height/2, i, -height/2, 0xff0000);
            scene.add(line);
        }
    },
    gridX: function(x) {
        x = Math.floor(x);
        var gridSize = 20;
        var width = 1200;
        return -width / 2 + gridSize / 2 + x * gridSize;
    },
    gridY: function(y) {
        y = Math.floor(y);
        var gridSize = 20;
        return gridSize / 2 + y * gridSize;
    },
};

