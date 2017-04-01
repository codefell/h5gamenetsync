var global = {
    event: {},
};
function initScene(eid) {

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();
    global.scene = scene;

    var je = $("#" + eid);
    var width = je.width();
    var height = je.height();
    global.width = width;
    global.height = height;

    // create a camera, which defines where we're looking at.
    //var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 1000);

    // create a render and set the size
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x0));
    //renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(width, height);

    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(100, 100);
    var planeMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);

    // rotate and position the plane
    //plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;

    // add the plane to the scene
    scene.add(plane);


    // position and point the camera to the center of the scene
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 30;
    camera.lookAt(scene.position);

    // add the output of the renderer to the html element
    document.getElementById(eid).appendChild(renderer.domElement);

    // render the scene

    var renderScene = function() {
        requestAnimationFrame(renderScene);
        renderer.render(scene, camera);
    };
    renderScene();
}

function initEvent() {
    $(document).keydown(function (e) {
        var key = String.fromCharCode(e.which);
        global.event.keydown = true;
        global.event.key = key;
    });
    $("#WebGLoutput").click(function (e) {
        var rect = $("#WebGLoutput")[0].getBoundingClientRect();
        var x = Math.floor(e.clientX - rect.left);
        var y = Math.floor(e.clientY - rect.top);
        x = -(global.width / 2- x);
        y = global.height / 2- y;
        global.event.mouseKeyDown = true;
        global.event.mousePos = {x: x, y: y};
    });
}

function time() {
    return (new Date()).getTime() / 1000;
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
        global.event = {};
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

$(function () {
    UpdateHandles.init();
    setInterval(UpdateHandles.update, 1000/60);
});
