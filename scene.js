var global = {};

function makeCircle(x, y, r, color) {
    // create the ground plane
    var geometry = new THREE.CircleGeometry(r, 36);
    var material = new THREE.MeshBasicMaterial({color: color, transparent: true, opacity: 0.5});
    var circle = new THREE.Mesh(geometry, material);

    // rotate and position the plane
    //plane.rotation.x = -0.5 * Math.PI;
    circle.position.x = x;
    circle.position.y = y;
    circle.position.z = 0;

    // add the plane to the scene
    global.scene.add(circle);
    return {r: r, x: x, y: y, sprite: circle};
}

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
    var camera = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 1, 1000);

    // create a render and set the size
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x0));
    //renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(width, height);

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
            console.log(String.fromCharCode(e.which));
            });
    $("#WebGLoutput0").click(function (e) {
            var rect0 = $("#WebGLoutput0")[0].getBoundingClientRect();
            var x = Math.floor(e.clientX - rect0.left);
            var y = Math.floor(e.clientY - rect0.top);
            x = -(100 - x);
            y = 100 - y;
            console.log(x, y);
            });
}
