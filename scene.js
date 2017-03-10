function initScene() {
    var e = $("#WebGLoutput0");
    var width = e.width();
    var height = e.height();
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();
    window.scene = scene;
    window.cfg.sw = width;
    window.cfg.sh = height;
    window.cfg.left = -width/2;
    window.cfg.right= width/2;

    // create a camera, which defines where we're looking at.
    //var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 1, 1000);

    // create a render and set the size
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x0));
    //renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(width, height);
    window.renderer = renderer;

    // position and point the camera to the center of the scene
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 30;
    camera.lookAt(scene.position);

    // add the output of the renderer to the html element
    document.getElementById("WebGLoutput0").appendChild(renderer.domElement);

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
            });
    $("#WebGLoutput0").click(function (e) {
            var rect0 = $("#WebGLoutput0")[0].getBoundingClientRect();
            var x = Math.floor(e.clientX - rect0.left);
            var y = Math.floor(e.clientY - rect0.top);
            var je = $(this);
            x = -(je.width() / 2 - x);
            y = je.height() / 2 - y;
            });
}

function initCfg() {
    window.cfg = {};
    window.cfg.gridSize = 20;
}

function initGrid() {
    var e = $("#measure");
    var index = 0;
    console.log(cfg);
    for (var i = -cfg.sw/2; i < cfg.sw/2; i += cfg.gridSize) {
        newLine(i, 40, i, -40, 0xff0000);
        e.append("<div>" + index + "</div>");
        index++;
    }
}

function newLine(x0, y0, x1, y1, color) {
    var material = new THREE.LineBasicMaterial({ color: color});
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(x0, y0, 0));
    geometry.vertices.push(new THREE.Vector3(x1, y1, 0));
    var line = new THREE.Line(geometry, material);
    scene.add(line);
}

function newUnit(x, y, color) {
    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(cfg.gridSize, cfg.gridSize);
    var planeMaterial = new THREE.MeshBasicMaterial({color: color});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.position.x = gridX(x);
    plane.position.y = cfg.gridSize / 2 + y * cfg.gridSize;
    plane.position.z = 0;

    // add the plane to the scene
    scene.add(plane);
    return plane;
}

function gridX(x) {
    x = Math.floor(x);
    return cfg.left + cfg.gridSize / 2 + x * cfg.gridSize;
}
