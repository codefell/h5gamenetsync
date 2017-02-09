var util = {
    time: function() {
        return (new Date().getTime()) / 1000.0;
    },
    newPlane: function (x, y, color) {
        // create the ground plane
        var planeGeometry = new THREE.PlaneGeometry(20, 20);
        var planeMaterial = new THREE.MeshBasicMaterial({color: color});
        var plane = new THREE.Mesh(planeGeometry, planeMaterial);

        // rotate and position the plane
        //plane.rotation.x = -0.5 * Math.PI;
        plane.position.x = x;
        plane.position.y = y;
        plane.position.z = 0;

        // add the plane to the scene
        scenes[0].add(plane);
        return plane;
    },
    addMethodUpdate: function (o) {
        var f = function () {
            o.update();
        };
        UpdateHandles.addHandle(f);
        return f;
    },
};

