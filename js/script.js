let mobile = false;
let infoShown = false;
if ( navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) {
    mobile = true;
} else {
    mobile = false;
}

class ImageSphere {
    constructor(radius, w, h, img) {
        const sphere = new THREE.SphereGeometry (radius, w, h);
        sphere.scale(-1, 1, 1);
        let material = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(img)
        });
        this.imageSphere = new THREE.Mesh(sphere, material);
    }
    loadMesh() {
        return this.imageSphere;
    }
}

class Target {
    constructor(img, x, y, z, id) {
        const map = new THREE.TextureLoader().load(img);
        const material = new THREE.SpriteMaterial({
            map: map,
            color: 0xffffff
        });
        this.sprite = new THREE.Sprite(material);
        this.sprite.userData.id = id;
        this.sprite.position.set(x, y, z);
    }
    loadMesh() {
        return this.sprite;
    }
}

class Info {
    constructor() {
        this.info = document.createElement('div');
        let width = (window.innerWidth / 2) - 150;
        let height = (window.innerHeight / 2) - 250 > 0 ? (window.innerHeight / 2) - 250 : 25;
        this.info.id = 'info';
        this.info.style.top = height + 'px';
        this.info.style.left = width + 'px';
        this.close = document.createElement('i');
        this.close.id = 'close';
        this.close.className = 'fa fa-2x fa-times';
        this.close.ariaHidden = 'true';
        this.info.appendChild(this.close);
        let title = document.createElement('div');
        title.id = 'infotitle';
        this.info.appendChild(title);
        let description = document.createElement('div');
        description.id = 'description';
        this.info.appendChild(description);
    }
    showInfo() {
        infoShown = true;
        return this.info;
    }
    removeInfo() {
        infoShown = false;
        this.info.parentNode.removeChild(this.info);
    }
}

class Scene {
    constructor() {
        this.createScene();
        this.addLights();
        this.render();
    }
    createScene() {
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.2, 200);
        this.camera.position.set(0.1, 0, 0.1);
        this.renderer = new THREE.WebGLRenderer;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.controls = new THREE.OrbitControls(this.camera);
        this.controls.target = new THREE.Vector3(0, 0, 0);
        if(mobile) {
            this.controlsMobile = new THREE.DeviceOrientationControls(this.camera);
        }
        this.container = document.getElementById('container');
        this.container.appendChild(this.renderer.domElement);
        this.container.addEventListener( 'mousedown', this.mouseClick.bind(this), false );
    }
    loadJSON(callback) {
        let req = new XMLHttpRequest();
        req.open('GET', './js/iteminfo.json', true);
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == "200") {
                callback(req.responseText);
            }
        };
        req.send(null);
    }
    mouseClick(event) {
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    	this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        let intersects = this.raycaster.intersectObjects(this.scene.children);
        if(infoShown === false) {
            for ( var i = 0; i < intersects.length; i++ ) {
                if (intersects[i].object.type === "Sprite") {
                    this.addInfo(new Info());
                    const title = document.getElementById('infotitle');
                    const description = document.getElementById('description');
                    const info = document.getElementById('info');
                    let obj = intersects[i].object.userData.id;
                    this.loadJSON((response) => {
                        let json = JSON.parse(response);
                        title.innerHTML = json[obj].title;
                        description.innerHTML = json[obj].description;
                        if(!mobile || window.innerHeight > window.innerWidth) {
                            let img = document.createElement("img");
                            img.src = json[obj].img;
                            info.appendChild(img);
                        }
                    });
                }
            }
        }
    }
    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    addLights() {
        this.ambientLight = new THREE.AmbientLight(0xaaaaaa);
        this.scene.add(this.ambientLight);
        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.position.set(0, 50, 50);
        this.scene.add(this.light);
    }
    render() {
        requestAnimationFrame(() => {
            this.render();
        });
        if(mobile) this.controlsMobile.update();
        window.addEventListener('resize', this.resize(), false);
        this.renderer.render(this.scene, this.camera);
    }
    add(mesh) {
        this.scene.add(mesh.loadMesh());
    }
    addInfo(info) {
		this.container.appendChild(info.showInfo());
        document.getElementById('close').onclick = () => {
            info.removeInfo();
        };
        window.addEventListener('orientationchange', () => {
            info.removeInfo();
        }, false);
    }
}

let scene = new Scene();
scene.add(new ImageSphere(100, 60, 40, './images/townhouse.jpg'));
scene.add(new Target('./images/click-sprite.png', 7.3, -3, -9, 'vase'));
scene.add(new Target('./images/click-sprite.png', 3.6, 4.5, 12, 'lamp'));
scene.add(new Target('./images/click-sprite.png', -12, -6, 0, 'rug'));
