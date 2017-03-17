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
    move: function (pos, direction, speed, time) {
        var dis = speed * time;
        pos = direction.clone().normalize().multiplyScalar(dis).add(pos);
        return pos;
    },
    moveTo: function (pos, target, speed, time) {
        var v = target.clone().sub(pos);
        var dis = speed * time;
        var reach = false;
        if (dis > v.length()) {
            dis = v.length();
            reach = true;
        }
        v.normalize().multiplyScalar(dis);
        return [v.add(pos), reach];
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
};

