var global = {
    scale: 30
};

function time() {
    return (new Date()).getTime() / 1000;
}

function makeRect(x, y, width, height, color) {
    var planeGeometry = new THREE.PlaneGeometry(width, height);
    var planeMaterial = new THREE.MeshBasicMaterial({color: color});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.x = x;
    plane.position.y = y;
    plane.position.z = 0;
    global.scene.add(plane);
    return plane;
}

function makeCircle(x, y, radius, color) {
    var geometry = new THREE.CircleGeometry(radius, 36);
    var material = new THREE.MeshBasicMaterial({color: color});
    var circle = new THREE.Mesh( geometry, material );
    circle.position.x = x;
    circle.position.y = y;
    circle.position.z = 0;
    global.scene.add(circle);
    return circle;
}

function initScene(eid) {

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    global.scene = new THREE.Scene();

    var e = $("#" + eid);
    var width = e.width();
    var height = e.width();
    global.width = width / global.scale;
    global.height = height / global.scale;

    var camera = new THREE.OrthographicCamera(
        -global.width / 2,
        global.width / 2,
        global.height / 2,
        -global.height / 2,
        1,
        1000);

    // create a render and set the size
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x0));
    renderer.setSize(width, height);

    // position and point the camera to the center of the scene
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 30;
    camera.lookAt(global.scene.position);

    // add the output of the renderer to the html element
    document.getElementById(eid).appendChild(renderer.domElement);

    // render the scene

    var renderScene = function() {
        requestAnimationFrame(renderScene);
        renderer.render(global.scene, camera);
    };
    renderScene();
    /*
    UpdateHandles.addHandle(function () {
        renderer.render(global.scene, camera);
    });
    */
}

var UpdateHandles = {
    startTime: 0,
    lastUpdateTime: 0,
    time: 0,
    deltaTime: 0,
    handles: [],
    init: function() {
        UpdateHandles.startTime = time();
        UpdateHandles.lastUpdateTime = 
            UpdateHandles.startTime;
        UpdateHandles.time = UpdateHandles.startTime;
        UpdateHandles.deltaTime = 0;
    },
    addHandle: function (handle) {
        for (var i = 0; i < this.handles.length; i++) {
            if (this.handles[i] == null) {
                this.handles[i] = handle;
                return;
            }
        }
        this.handles.push(handle);
    },
    delHandle: function (handle) {
        for (var i = 0; i < this.handles.length; i++) {
            if (this.handles[i] == handle) {
                this.handles[i] = null;
                return;
            }
        }
    },
    update: function () {
        UpdateHandles.time = time();
        UpdateHandles.deltaTime = 
            UpdateHandles.time - UpdateHandles.lastUpdateTime;
        
        for (i in UpdateHandles.handles) {
            handle = UpdateHandles.handles[i];
            if (handle) {
                handle();
            }
        }
        UpdateHandles.lastUpdateTime = UpdateHandles.time;
        UpdateHandles.deltaTime = 0; 
    },
    addMethodUpdate: function (o) {
        var f = function () {
            o.update();
        };
        UpdateHandles.addHandle(f);
        return f;
    },
    addUpdate: function (fn, o) {
        var f = function () {
            fn(o);
        };
        UpdateHandles.addHandle(f);
        return f;
    },
};

function initEvent() {
    $(document).keydown(function (e) {
            console.log(String.fromCharCode(e.which));
            });
    $("#WebGLoutput").click(function (e) {
            var je = $(this);
            var rect = this.getBoundingClientRect();
            var x = Math.floor(e.clientX - rect.left);
            var y = Math.floor(e.clientY - rect.top);
            x = -(je.width() / 2- x);
            y = je.height() / 2 - y;
            });
}

$(function () {
    UpdateHandles.init();
    setInterval(UpdateHandles.update, 1000/60);
});
