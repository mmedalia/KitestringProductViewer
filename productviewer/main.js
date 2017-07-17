var sceneCreator = {

    // variables
    sceneSettings: false,
    camera: false,
    stereoEffect: false,
    controls: false,
    stereoControls: false,
    scene: false,
    cssScene: false,
    mouse: false,
    raycaster: false,
    renderer: false,
    cssRenderer: false,
    container: false,
    textlabels: [],
    hotspots: [],
    relectiveMap: false,
    canvasObject: false,
    cssObject: false,

    onReady: function() {

        var url = window.location.href;
        try{
            var arguments = url.split('#')[1].split('=');
            arguments.shift();
            console.log("args : " + arguments);
        }catch(err){
            console.log("No delimiter found");
        }
        
        
        $.getScript( "products/barCabinet/barCabinet.js" )
        //$.getScript( "products/magicPak/magicPak.js" )
        //$.getScript( "products/ge/refer/geRefer.js" )
          .done(function( script, textStatus ) {
            console.log( textStatus + " - Loaded : " + productInfo.sceneSettings.name );
            sceneCreator._initScene();
            productInfo.initProductFunctions();
          })
          .fail(function( jqxhr, settings, exception ) {
            console.log( "FAILED TO LOAD PRODUCT FILE" );
        });
        
        //this._initScene();
    },

    _initScene(productSettings){

        console.log("Init Scene");

        this.sceneSettings = productInfo.sceneSettings;

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer(this.sceneSettings.renderer.params);
        this.renderer.shadowMapEnabled = this.sceneSettings.renderer.shadowMapEnabled;
        this.renderer.setClearColor(this.sceneSettings.backgroundColor);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.zIndex = 1;
        this.renderer.domElement.style.top = 0;

        this.container = document.createElement('div');
        document.body.appendChild(this.container);
        this.container.appendChild(this.renderer.domElement);

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.camera = new THREE.PerspectiveCamera(this.sceneSettings.camera.fov, window.innerWidth / window.innerHeight, this.sceneSettings.camera.near, this.sceneSettings.camera.far);
        var camPos = this.sceneSettings.camera.position;
        this.camera.position.set(camPos.x, camPos.y, camPos.z);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        var camTarget = this.sceneSettings.controls.target;
        this.controls.target.set(camTarget.x, camTarget.y, camTarget.z),
        this.controls.minDistance = this.sceneSettings.controls.minDistance,
        this.controls.maxDistance = this.sceneSettings.controls.maxDistance,
        this.controls.maxPolarAngle = this.sceneSettings.controls.maxPolarAngle,
        this.controls.maxPolarAngle = this.sceneSettings.controls.maxPolarAngle,
        this.controls.maxPolarAngle = this.sceneSettings.controls.maxPolarAngle,
        this.controls.enableZoom = this.sceneSettings.controls.enableZoom,
        this.controls.enablePan = this.sceneSettings.controls.enablePan,
        this.controls.enableKeys = this.sceneSettings.controls.enableKeys,

        this.stereoControls = new THREE.DeviceOrientationControls(this.camera);

        this.stereoEffect = new THREE.StereoEffect(this.renderer);
        this.stereoEffect.setSize(window.innerWidth, window.innerHeight);

        //CREATE SCENE LIGHTING
        this._addLighting();

        //CREATE SCENE SETTING
        //this._createSetting();

        //REFLECTION MAP
        var path = this.sceneSettings.media.envMapPath;
        var format = this.sceneSettings.media.envMapFormat;
        var urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];
        this.relectiveMap = new THREE.CubeTextureLoader().load(urls);
        this.relectiveMap.format = THREE.RGBFormat;

        // BUILD THE SCENE
        // LOAD EXTERNAL MODELS
        if (this.sceneSettings.media.colladaModels.length > 0) {
            modelLoader.loadModels();
        }

        //CREATE THE INITIAL USER INTERFACE
        if(this.sceneSettings.interface.canvases[0] != null){
            for (var i = this.sceneSettings.interface.canvases.length - 1; i >= 0; i--) {
                
                //NEED TO ADD A SWITCH STATEMENT TO HANDLE DIFFERENT TYPES OF CANVASES

                //HTML BASE CANVASES - REQUIRES CSSRenderer
                var canvasInfo = this.sceneSettings.interface.canvases[i];
                sceneInterface._createHTMLPlane(canvasInfo.size.w, canvasInfo.size.h,
                    new THREE.Vector3(canvasInfo.position.x, canvasInfo.position.y, canvasInfo.position.z),
                    new THREE.Vector3(canvasInfo.rotation.x, canvasInfo.rotation.y, canvasInfo.rotation.z),
                    canvasInfo.htmlSource);

                //COMING SOON: CONTEXT BASED CANVAS - REQUIRES EXTENDED SETUP
                //sceneInterface._createCanvasTexture(600, 600, new THREE.Vector3(400, 350, 0), new THREE.Vector3(0, 3.14, 0));
            }
        }

        //CREATE HOTSPOTS
        this._createHotspot("Doors", 0, 297.5, -50, (Math.PI / 2.0), "Open/Close Doors");
        this._createHotspot("Drawers", 0, 195, -35, (Math.PI / 2.0), "Open/Close Drawers");
        document.getElementById("Drawers").style.visibility = "hidden";
        

        //sceneInterface._createHTMLPlane(250, 150, new THREE.Vector3(300, 375, 0), new THREE.Vector3(0, 3.14, 0), 'uiContent.html');
        

        //HANDLE KEYPRESSES
        $(document).keypress(function(e) {
            e.preventDefault();
            console.log("Keypress: " + e.charCode + ", " + e.which);
            var theKey = e.which;
            switch (e.which) {

                //Q-KEY
                case 113:
                    sceneCreator._moveCamera(-100, 50, -150, new THREE.Vector3(0, 100, 0), 3000);
                    break;

                case 119:
                    //sceneCreator.sceneLoaded();
                    break;

            }
        });

        //HANDLE CLICKS AND TOUCHES
        $(document).on('mousedown', function(e) {
            e.preventDefault();
            sceneCreator.handleRaycast(e);
        });

        $(document).on('touchstart', function(e) {
            e.preventDefault();
            sceneCreator.handleRaycast(e);
        });


        //
        // animate
        //
        var _this = this;
        var animate = function() {
            requestAnimationFrame(animate);

            //console.log( "Control Type: " + sceneCreator.sceneSettings.controlType);
            switch (sceneCreator.sceneSettings.controlType) {
                case "orbit":
                    _this.controls.update();
                    break;

                case "stereo":
                    _this.stereoControls.update();
                    break;

                case "swivle":
                    _this._swivleCamera();
                    break;
            }


            TWEEN.update();
            //_this.controls.update();
            //_this.stereoControls.update();
            _this._render();
        }
        animate();

    },

    sceneLoaded() {
        sceneCreator._moveObject(sceneCreator.canvasObject, new THREE.Vector3(250, 150, 0), 2000);
        sceneCreator._moveObject(sceneCreator.cssObject, new THREE.Vector3(250, 150, 0), 2000);
    },

    onResize: function() {
        sceneCreator.camera.aspect = window.innerWidth / window.innerHeight;
        sceneCreator.camera.updateProjectionMatrix();

        if ((sceneCreator.cssRenderer != null) || (sceneCreator.cssRenderer != undefined)) {
            //sceneCreator.cssRenderer.render(sceneCreator.cssScene, sceneCreator.camera);
            sceneCreator.cssRenderer.setSize(window.innerWidth, window.innerHeight);
        }

        sceneCreator.renderer.setSize(window.innerWidth, window.innerHeight);

    },

    _thisKeypress(event) {

    },

    _render: function() {
        for (var i = 0; i < this.textlabels.length; i++) {
            this.textlabels[i].updatePosition();
        }

        switch (sceneCreator.sceneSettings.renderType) {
            case "standard":
                this.renderer.render(this.scene, this.camera);
                break;

            case "stereo":
                this.stereoEffect.render(this.scene, this.camera);
                break;
        }

        if ((this.cssRenderer != null) || (this.cssRenderer != undefined)) {
            this.cssRenderer.render(this.cssScene, this.camera);
        }
    },

    handleRaycast(event) {

        sceneCreator.mouse.x = (event.clientX / sceneCreator.renderer.domElement.clientWidth) * 2 - 1;
        sceneCreator.mouse.y = -(event.clientY / sceneCreator.renderer.domElement.clientHeight) * 2 + 1;

        if (sceneCreator.sceneSettings.controlType == "stereo") {
            sceneCreator.raycaster.setFromCamera(new THREE.Vector2(0, 0), sceneCreator.camera);
        } else {
            sceneCreator.raycaster.setFromCamera(sceneCreator.mouse, sceneCreator.camera);
        }

        //THIS FUNCTIONALITY NEEDS TO BE BROKEN OUT INTO A DYNAMIC SET OF CLICKABLE OBJECTS
        var intersects = sceneCreator.raycaster.intersectObjects(sceneCreator.hotspots);

        if (intersects.length > 0) {

            console.log(intersects[0].object.name + " hotspot has been clicked.");

            //CALL HANDLERAYCAST IN PRODUCT SCRIPT TO HANDLE CUSTOM ACTIONS
            try{
                productInfo.handleRaycast(intersects[0].object.name);
            }catch(err){
                console.log("No Product Raycasting found");
            }
            
        }

    },

    sendTouchToRaycast(event) {

        event.preventDefault();

        event.clientX = event.touches[0].clientX;
        event.clientY = event.touches[0].clientY;
        sceneCreator.handleRaycast(event);

    },

    _moveCamera(pX, pY, pZ, lookTarget, time) {
        console.log("MOVING THE CAM");
        sceneCreator.controls.enabled = false;
        sceneCreator.sceneSettings.controlType = "animate";
        var camPos = sceneCreator.camera.position;
        var startPos = {
            x: camPos.x,
            y: camPos.y,
            z: camPos.z
        };
        var stopPos = {
            x: pX,
            y: pY,
            z: pZ
        };
        var camTween = new TWEEN.Tween(startPos).to(stopPos, time);
        camTween.onUpdate(function() {
            sceneCreator.camera.position.set(startPos.x, startPos.y, startPos.z);
            sceneCreator.camera.lookAt(lookTarget);
            sceneCreator.camera.updateMatrix();
        }).easing(TWEEN.Easing.Cubic.Out).onComplete(function() {
            sceneCreator.controls.enabled = false;
        });
        camTween.start();
    },

    _moveObject(theObject, toPoint, time) {
        console.log("MOVING OBJECT : " + theObject.name);
        var startPos = {
            x: theObject.position.x,
            y: theObject.position.y,
            z: theObject.position.z
        };
        var stopPos = {
            x: toPoint.x,
            y: toPoint.y,
            z: toPoint.z
        };
        var objTween = new TWEEN.Tween(startPos).to(stopPos, time);
        objTween.onUpdate(function() {
            theObject.position.set(startPos.x, startPos.y, startPos.z);
            theObject.updateMatrix();
        }).easing(TWEEN.Easing.Elastic.Out).onComplete(function() {
            //sceneCreator.controls.enabled = false;
            console.log("Movement complete");
        });
        objTween.start();
    },

    _addLighting() {
        console.log("Adding " + this.sceneSettings.lighting.lights.length + " lights");
        var theLights = this.sceneSettings.lighting.lights;
        for (var i = theLights.length - 1; i >= 0; i--) {
            switch (theLights[i].type) {
                case "ambient":
                    var ambLight = new THREE.AmbientLight(theLights[i].color);
                    ambLight.intensity = theLights[i].intensity;
                    this.scene.add(ambLight);
                    console.log("Added ambient light.");
                    break;

                case "spot":
                    var spotLight = new THREE.SpotLight(theLights[i].color);
                    spotLight.position.set(theLights[i].position.x, theLights[i].position.y, theLights[i].position.z);
                    spotLight.intensity = theLights[i].intensity;
                    spotLight.angle = theLights[i].angle;
                    spotLight.penumbra = theLights[i].penumbra;
                    spotLight.decay = theLights[i].decay;
                    spotLight.distance = theLights[i].distance;
                    spotLight.castShadow = theLights[i].castShadow;
                    spotLight.shadowDarkness = theLights[i].shadowDarkness;

                    //NEED TO HANDLE SHADOW
                    spotLight.shadow.mapSize.width = 1024;
                    spotLight.shadow.mapSize.height = 1024;
                    spotLight.shadow.camera.near = 10;
                    spotLight.shadow.camera.far = 10000;

                    this.scene.add(spotLight);

                    if(theLights[i].addHelper != null){
                      var lightHelper = new THREE.SpotLightHelper(spotLight);
                      this.scene.add(lightHelper);
                    }

                    console.log("Added spot light.");

                    break;

                case "directional":
                    var directionalLight = new THREE.DirectionalLight( theLights[i].color );
                    directionalLight.intensity = theLights[i].intensity;
                    directionalLight.castShadow = true;
                    directionalLight.position.set(theLights[i].position.x, theLights[i].position.y, theLights[i].position.z);
                    this.scene.add( directionalLight );
                    console.log("Added directional light.");
                    break;

                case "area":
                    //NEED TO ADD
                    break;
            }
        }

    },

    _createSetting() {

        //FLOOR MATERIAL
        var textureLoader = new THREE.TextureLoader();
        var floorMat = new THREE.MeshStandardMaterial({
            roughness: 0.8,
            color: 0xffffff,
            metalness: 0.2,
            bumpScale: 0.005,
        });
        textureLoader.load("textures/hardwood2_diffuse.jpg", function(map) {
            map.wrapS = THREE.RepeatWrapping;
            map.wrapT = THREE.RepeatWrapping;
            map.anisotropy = 4;
            map.repeat.set(5, 10);
            floorMat.map = map;
            floorMat.needsUpdate = true;

            var floorMesh = sceneCreator.createGeoPlane(1000, 1000, floorMat);
            floorMesh.rotation.x = -Math.PI / 2.0;
            floorMesh.position.y = 0;
            floorMesh.receiveShadow = true;

        });
        textureLoader.load("textures/hardwood2_bump.jpg", function(map) {
            map.wrapS = THREE.RepeatWrapping;
            map.wrapT = THREE.RepeatWrapping;
            map.anisotropy = 4;
            map.repeat.set(5, 10);
            floorMat.bumpMap = map;
            floorMat.needsUpdate = true;
        });
        textureLoader.load("textures/hardwood2_roughness.jpg", function(map) {
            map.wrapS = THREE.RepeatWrapping;
            map.wrapT = THREE.RepeatWrapping;
            map.anisotropy = 4;
            map.repeat.set(5, 10);
            floorMat.roughnessMap = map;
            floorMat.needsUpdate = true;
        });

    },

    createGeoPlane(xSize, ySize, planeMat) {
        var planeGeometry = new THREE.PlaneBufferGeometry(xSize, ySize);
        var planeMesh = new THREE.Mesh(planeGeometry, planeMat);
        planeMesh.receiveShadow = true;
        this.scene.add(planeMesh);

        return planeMesh;
    },

    _createHotspot(hsName, x, y, z, xRot, labelText) {
        //var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
        var geometry = new THREE.CylinderGeometry(10, 10, 2.5, 32);

        var material = new THREE.MeshStandardMaterial({
            color: 0xc7202c,
            metalness: 0.2,
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.name = hsName;
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;
        mesh.rotation.x = xRot;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = false;
        this.scene.add(mesh);
        this.hotspots.push(mesh);

        var text = this._createTextLabel(hsName);
        text.setHTML(labelText);
        text.setParent(mesh);
        this.textlabels.push(text);
        this.container.appendChild(text.element);

    },

    _createTextLabel: function(divID) {
        var div = document.createElement('div');
        div.id = divID;
        div.className = 'text-label';
        div.style.position = 'absolute';
        div.style.width = 100;
        div.style.height = 100;
        div.innerHTML = "hi there!";
        div.style.top = -1000;
        div.style.left = -1000;

        var _this = this;

        return {
            element: div,
            parent: false,
            position: new THREE.Vector3(0, 0, 0),
            setHTML: function(html) {
                this.element.innerHTML = html;
            },
            setParent: function(threejsobj) {
                this.parent = threejsobj;
            },
            updatePosition: function() {
                if (parent) {
                    this.position.copy(this.parent.position);
                }

                var coords2d = this.get2DCoords(this.position, _this.camera);
                //console.log(coords2d.x + ", " + coords2d.y);
                this.element.style.left = (coords2d.x + 15) + 'px';
                this.element.style.top = (coords2d.y - 15) + 'px';
                //this.element.style.left = this.position.x + 15 + 'px';
                //this.element.style.top = this.position.y + 5 + 'px';
            },
            get2DCoords: function(position, camera) {
                var vector = position.project(camera);
                vector.x = (vector.x + 1) / 2 * window.innerWidth;
                vector.y = -(vector.y - 1) / 2 * window.innerHeight;
                return vector;
            }
        };
    },

};

sceneCreator.container = document.getElementById('container');
sceneCreator.onReady();
window.addEventListener('resize', function() {
    sceneCreator.onResize();
}, false);