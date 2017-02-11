//var scenes = [];
function initScene(eid) {

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();

    // create a camera, which defines where we're looking at.
    //var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 1000);

    // create a render and set the size
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE));
    //renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(200, 200);

    // position and point the camera to the center of the scene
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 30;
    camera.lookAt(scene.position);

    // add the output of the renderer to the html element
    document.getElementById(eid).appendChild(renderer.domElement);

    //scenes.push(scene);

    // render the scene
    var renderScene = function() {
        requestAnimationFrame(renderScene);
        renderer.render(scene, camera);
    };
    renderScene();
    return {scene: scene, renderer: renderer};
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

var UpdateHandles = {
    handles: [],
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
        requestAnimationFrame(UpdateHandles.update);
        for (i in UpdateHandles.handles) {
            handle = UpdateHandles.handles[i];
            if (handle) {
                handle();
            }
        }
    },
    addMethodUpdate: function (o) {
        var f = function () {
            o.update();
        };
        UpdateHandles.addHandle(f);
        return f;
    },
};

$(function () {UpdateHandles.update();});
