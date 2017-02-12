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
};

