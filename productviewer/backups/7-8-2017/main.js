var sceneCreator = {

  // variables
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
  doorsOpen: false,
  rightDoor: false,
  leftDoor: false,
  drawersOpen: false,
  topDrawer: false,
  bottomDrawer: false,
  effectController: false,
  canvasObject : false,
  cssObject : false,

  onReady: function() {

    this.effectController = {
      controlType: "orbit",
      renderType: "standard",
    };
    
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({alpha:true});
    this.renderer.setClearColor(0x7c95bc);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.zIndex = 1;
    this.renderer.domElement.style.top = 0;

    this.container = document.createElement( 'div' );
    document.body.appendChild( this.container );
    this.container.appendChild(this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 50, 50000);
    this.camera.position.set( 0, 300, -1500 );

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set( 0, 300, 0 );
    this.controls.minDistance = 5;
    this.controls.maxDistance = 5000;
    this.controls.maxPolarAngle = Math.PI/1.8;
    this.controls.enableDamping = true;
    this.controls.dampingFactor =  0.25;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableKeys = false;

    this.stereoControls = new THREE.DeviceOrientationControls( this.camera );

    this.stereoEffect = new THREE.StereoEffect( this.renderer );
    this.stereoEffect.setSize( window.innerWidth, window.innerHeight );

    this.doorsOpen = false;
    this.drawersOpen = false;


    //CREATE SCENE LIGHTING
    this._addLighting();

    //CREATE SCENE SETTING
    this._createSetting();
    
    //REFLECTION MAP
    var path = "models/BarCabinet2/textures/SwedishRoyalCastle/";
    var format = '.jpg';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
      ];
    this.relectiveMap = new THREE.CubeTextureLoader().load( urls );
    this.relectiveMap.format = THREE.RGBFormat;

    // BUILD THE SCENE
    // LOAD EXTERNAL MODELS
    var modelPath = "models/BarCabinet2/bar_cabinet.dae";
    this.loadModel(modelPath, this.scene, function(theDAE, theScene){
      document.getElementById("progressBar").style.visibility = "hidden";

      theDAE.traverse( function ( child ) {

        //console.log(child.name);
        if(child.name != ""){
          switch(child.name){
            case "L_door_ROT":
              this.leftDoor = child;
            break;

            case "R_door_ROT":
              this.rightDoor = child;
            break;

            case "drawer_01":
              this.topDrawer = child;
            break;

            case "drawer_02":
              this.bottomDrawer = child;
            break;
          }
        }

        if ( child instanceof THREE.Mesh ) {
          child.castShadow = true;
          //console.log(child.material.type);
          if(child.material.type == "MultiMaterial"){
            for (var m = 0; m < child.material.materials.length; m++) {
              //console.log("MULTI Mesh Mat : " + child.material.materials[m].name);
              sceneCreator._findMaterialsToEdit(child.material.materials[m]);
            }
          }else{
            //console.log("Mesh Mat : " + child.material.name);
            sceneCreator._findMaterialsToEdit(child.material);
          }
          
        }

      }, function(progress){
        //console.log(progress);
        //var loadPercent = progress.loaded/progress.total;
        //console.log(loadPercent + "%");
      });

      theDAE.scale.x = theDAE.scale.y = theDAE.scale.z = 1000.0;
      theDAE.updateMatrix();

      theScene.add(theDAE);
      //sceneCreator.sceneLoaded();
    });

    /*
    var roomPath = "models/WhiteRoom/WhiteRoom.dae";
    this.loadModel(roomPath, this.scene, function(theDAE, theScene){
      document.getElementById("progressBar").style.visibility = "hidden";
      theDAE.traverse( function ( child ) {

        console.log(child.name);
        switch(child.name){
          case "Area":
          case "light":
            child.visible = false;
          break;
        }

        if ( child instanceof THREE.Mesh ) {
          child.castShadow = true;
          if(child.material.type == "MultiMaterial"){
            for (var m = 0; m < child.material.materials.length; m++) {
              console.log("MULTI Mesh Mat : " + child.material.materials[m].name);
            }
          }else{
            console.log("Mesh Mat : " + child.material.name);
            var newMat = new THREE.MeshStandardMaterial( {
              color: 0xc7202c,
              metalness: 0.2,
            });
            child.material = newMat;
          }
          
        }


      }, function(progress){
        //console.log(progress);;
      });

      theDAE.scale.x = theDAE.scale.y = theDAE.scale.z = 300.0;
      theDAE.updateMatrix();
      theScene.add(theDAE);
    });
    */


    //CREATE HOTSPOTS
    this._createHotspot("Doors", 0, 675, -160, (Math.PI / 2.0), "Open/Close Doors");
    this._createHotspot("Drawers", 0, 350, -100, (Math.PI / 2.0), "Open/Close Drawers");
    document.getElementById("Drawers").style.visibility = "hidden";

    //this._createHTMLPlane();
    this._createCanvasTexture(600, 600, new THREE.Vector3(650, 350, 0), new THREE.Vector3(0, 3.14, 0));

    //HANDLE KEYPRESSES
    $(document).keypress(function(e) {
        e.preventDefault();
        console.log("Keypress: " + e.charCode + ", " + e.which);
        var theKey = e.which;
        switch(e.which){

          //Q-KEY
          case 113:
            sceneCreator._moveCamera(-100,50,-150, new THREE.Vector3(0,100,0), 3000);
          break;

          case 119:
            sceneCreator.sceneLoaded();
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

      //console.log( "Control Type: " + sceneCreator.effectController.controlType);
      switch(sceneCreator.effectController.controlType){
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

  sceneLoaded(){
    sceneCreator._moveObject(sceneCreator.canvasObject, new THREE.Vector3(250, 150, 0), 2000);
    sceneCreator._moveObject(sceneCreator.cssObject, new THREE.Vector3(250, 150, 0), 2000);
  },
  
  onResize: function() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
/*
    if((this.cssRenderer != null) || (this.cssRenderer != undefined)){
      this.cssRenderer.render( this.cssScene, this.camera );
    }
*/
    this.renderer.setSize(window.innerWidth, window.innerHeight);

  },

  _thisKeypress(event){

  },

  _render: function() {
    for(var i=0; i<this.textlabels.length; i++) {
      this.textlabels[i].updatePosition();
    }

    switch(sceneCreator.effectController.renderType){
      case "standard":
        this.renderer.render(this.scene, this.camera);
      break;

      case "stereo":
        this.stereoEffect.render( this.scene, this.camera );
      break;
    }
/*
    if((this.cssRenderer != null) || (this.cssRenderer != undefined)){
      this.cssRenderer.render( this.cssScene, this.camera );
    }
*/
  },

  handleRaycast( event ) {

    sceneCreator.mouse.x = ( event.clientX / sceneCreator.renderer.domElement.clientWidth ) * 2 - 1;
    sceneCreator.mouse.y = - ( event.clientY / sceneCreator.renderer.domElement.clientHeight ) * 2 + 1;

    if(sceneCreator.effectController.controlType == "stereo"){
      sceneCreator.raycaster.setFromCamera( new THREE.Vector2(0,0), sceneCreator.camera );
    }else{
      sceneCreator.raycaster.setFromCamera( sceneCreator.mouse, sceneCreator.camera );
    }
    
//THIS FUNCTIONALITY NEEDS TO BE BROKEN OUT INTO A DYNAMIC SET OF CLICKABLE OBJECTS
    var intersects = sceneCreator.raycaster.intersectObjects( sceneCreator.hotspots );

    if ( intersects.length > 0 ) {

      //intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );

      console.log( intersects[ 0 ].object.name + " hotspot has been clicked.");

      switch(intersects[ 0 ].object.name){
        case "Doors":

          if(!this.doorsOpen){
            this.doorsOpen = true;
            sceneCreator._openDoors();
            if(sceneCreator.effectController.renderType != "stereo"){
              document.getElementById("Drawers").style.visibility = "visible";
            }
          }else{
            if(this.drawersOpen){
              this.drawersOpen = false;
              sceneCreator._closeDrawers();
            }
            this.doorsOpen = false;
            sceneCreator._closeDoors();
            document.getElementById("Drawers").style.visibility = "hidden";
          }

        break;

        case "Drawers":

          if(this.doorsOpen){
            if(!this.drawersOpen){
              this.drawersOpen = true;
              sceneCreator._openDrawers();
            }else{
              this.drawersOpen = false;
              sceneCreator._closeDrawers();
            }
          }
          
        break;
      }

    }

    /*
    // Parse all the faces
    for ( var i in intersects ) {

      intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

    }
    */
  },

  sendTouchToRaycast( event ) {

    event.preventDefault();

    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    sceneCreator.handleRaycast( event );

  },

  _moveCamera( pX, pY, pZ, lookTarget, time ){
    console.log("MOVING THE CAM");
    sceneCreator.controls.enabled = false;
    sceneCreator.effectController.controlType = "animate";
    var camPos = sceneCreator.camera.position;
    var startPos = {x : camPos.x, y : camPos.y, z : camPos.z};
    var stopPos = { x : pX, y : pY, z : pZ};
    var camTween = new TWEEN.Tween(startPos).to(stopPos, time);
    camTween.onUpdate(function(){
        sceneCreator.camera.position.set(startPos.x, startPos.y, startPos.z);
        sceneCreator.camera.lookAt(lookTarget);
        sceneCreator.camera.updateMatrix();
    }).easing(TWEEN.Easing.Cubic.Out).onComplete(function(){
      sceneCreator.controls.enabled = false;
    });
    camTween.start();
  },

  _moveObject(theObject, toPoint, time){
    console.log("MOVING OBJECT : " + theObject.name);
    var startPos = {x : theObject.position.x, y : theObject.position.y, z : theObject.position.z};
    var stopPos = { x : toPoint.x, y : toPoint.y, z : toPoint.z};
    var objTween = new TWEEN.Tween(startPos).to(stopPos, time);
    objTween.onUpdate(function(){
        theObject.position.set(startPos.x, startPos.y, startPos.z);
        theObject.updateMatrix();
    }).easing(TWEEN.Easing.Elastic.Out).onComplete(function(){
      //sceneCreator.controls.enabled = false;
      console.log("Movement complete");
    });
    objTween.start();
  },

  loadModel(theModelPath, theScene, callback){
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load( theModelPath, function ( collada ) {

      dae = collada.scene;

      callback(dae, theScene);

    }, function(progress){
      //console.log(progress);
      var loadPercent = progress.loaded/progress.total;
      sceneCreator._progressBar(loadPercent);
      console.log(loadPercent + "%");
    });
  },

  _progressBar(percentLoaded){
    var elem = document.getElementById("theBar"); 
      var width = 100*percentLoaded;
      if (width >= 100) {
        document.getElementById("progressBar").style.visibility = "hidden";
      }else{
        elem.style.width = width + '%';
        document.getElementById("progressLabel").innerHTML = parseInt(width) + '%';
      }
  },

  _openDoors(){
    console.log("Opening the doors");
    var rDoorStart = { y: 0 };
    var rDoorStop = { y: -3 };
    var lDoorStart = { y: 0 };
    var lDoorStop = { y: 3 };
    var tweenRight = new TWEEN.Tween(rDoorStart).to(rDoorStop, 2000);
    tweenRight.onUpdate(function(){
        rightDoor.rotation.y = rDoorStart.y;
    });

    var tweenLeft = new TWEEN.Tween(lDoorStart).to(lDoorStop, 2000);
    tweenLeft.onUpdate(function(){
        leftDoor.rotation.y = lDoorStart.y;
    });
    tweenRight.start();
    tweenLeft.start();

  },

  _closeDoors(){
    console.log("Opening the doors");
    var rDoorStart = { y: -3 };
    var rDoorStop = { y: 0 };
    var lDoorStart = { y: 3 };
    var lDoorStop = { y: 0 };
    var tweenRight = new TWEEN.Tween(rDoorStart).to(rDoorStop, 2000);
    tweenRight.onUpdate(function(){
        rightDoor.rotation.y = rDoorStart.y;
    });

    var tweenLeft = new TWEEN.Tween(lDoorStart).to(lDoorStop, 2000);
    tweenLeft.onUpdate(function(){
        leftDoor.rotation.y = lDoorStart.y;
    });
    tweenRight.start();
    tweenLeft.start();

  },

  _openDrawers(){
    var tdStart = { z: 0.094 };
    var tdStop = { z: 0.275 };
    var bdStart = { z: 0.094 };
    var bdStop = { z: 0.35 };
    var tweenTop = new TWEEN.Tween(tdStart).to(tdStop, 2000);
    tweenTop.onUpdate(function(){
        topDrawer.position.z = tdStart.z;
    });

    var tweenBottom = new TWEEN.Tween(bdStart).to(bdStop, 2000);
    tweenBottom.onUpdate(function(){
        bottomDrawer.position.z = bdStart.z;
    });
    tweenTop.start();
    tweenBottom.start();

  },

  _closeDrawers(){
    var tdStart = { z: 0.275 };
    var tdStop = { z: 0.094 };
    var bdStart = { z: 0.35 };
    var bdStop = { z: 0.094 };
    var tweenTop = new TWEEN.Tween(tdStart).to(tdStop, 2000);
    tweenTop.onUpdate(function(){
        topDrawer.position.z = tdStart.z;
    });

    var tweenBottom = new TWEEN.Tween(bdStart).to(bdStop, 2000);
    tweenBottom.onUpdate(function(){
        bottomDrawer.position.z = bdStart.z;
    });
    tweenTop.start();
    tweenBottom.start();

  },

  _findMaterialsToEdit(theMaterial){
    var modelTexturePath = "models/BarCabinet2/textures/";
    var bumpMapImage = "";
    var path = modelTexturePath + "/SwedishRoyalCastle/";
    var format = '.jpg';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
      ];
    var reflectionCube = new THREE.CubeTextureLoader().load( urls );
    reflectionCube.format = THREE.RGBFormat;


    
    switch(theMaterial.name){
      case "M_bar_canvas":
        bumpMapImage = modelTexturePath + "FabricPlain0007_3_S_nrml.png";
        this._enhanceMaterials(theMaterial, bumpMapImage);
      break;

      case "M_bar_wood":
      case "M_bar_shelves_wood":
        theMaterial.color.set(0x8B4513);
        bumpMapImage = modelTexturePath + "WoodFine0007_seamless_M_nrml.png";
        this._enhanceMaterials(theMaterial, bumpMapImage);
      break;

      case "M_bar_hinges":
      case "M_bar_casters":
      case "M_bar_brass":
        this._addEnvMap(theMaterial);
      break;
    }
  },

  _addEnvMap(theMaterial){
    
    theMaterial.envMap = this.relectiveMap;
    theMaterial.reflectivity = 0.5;
    theMaterial.needsUpdate = true;

  },

  _enhanceMaterials(theMaterial, bumpMap){
    //console.log("Enhacing material : " + theMaterial.name);
    var textureLoader = new THREE.TextureLoader();
    theMaterial.bumpScale = 0.005;
    textureLoader.load( bumpMap, function( map ) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      //map.anisotropy = 4;
      //map.repeat.set( 5, 15 );
      theMaterial.bumpMap = map;
      theMaterial.needsUpdate = true;
    } );
  },
  
  _addLighting(){

    //AMBIENT LIGHT
    this.scene.add( new THREE.AmbientLight( 0x888888 ) );

    /*
    //POINT LIGHT
    var pointLight = new THREE.PointLight( 0xff0000, 1, 100 );
    pointLight.position.set( 500, 500, 500 );
    sceneCreator.scene.add( pointLight );
    */

    //SPOT LIGHT
    var spotLight = new THREE.SpotLight( 0xffffff, 1 );
    spotLight.position.set( -2000, 5000, -5000 );
    spotLight.intensity = 1.25;
    spotLight.angle = Math.PI / 6.5;
    spotLight.penumbra = 0.25;
    spotLight.decay = 1.3;
    spotLight.distance = 10000;
    spotLight.castShadow = true;
    spotLight.shadowDarkness = 0.25;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 50000;
    this.scene.add( spotLight );

    var lightHelper = new THREE.SpotLightHelper( spotLight );
    this.scene.add( lightHelper );
    

  },

  _createSetting(){
    
    //FLOOR MATERIAL
    var textureLoader = new THREE.TextureLoader();
    var floorMat = new THREE.MeshStandardMaterial( {
      roughness: 0.8,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.005,
    });
    textureLoader.load( "textures/hardwood2_diffuse.jpg", function( map ) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set( 5, 10 );
      floorMat.map = map;
      floorMat.needsUpdate = true;

      var floorMesh = sceneCreator.createGeoPlane(5000,5000,floorMat);
      floorMesh.rotation.x = -Math.PI / 2.0;
      floorMesh.position.y = 0;
      floorMesh.receiveShadow = true;

    } );
    textureLoader.load( "textures/hardwood2_bump.jpg", function( map ) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set( 5, 10 );
      floorMat.bumpMap = map;
      floorMat.needsUpdate = true;
    } );
    textureLoader.load( "textures/hardwood2_roughness.jpg", function( map ) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set( 5, 10 );
      floorMat.roughnessMap = map;
      floorMat.needsUpdate = true;
    } );

  },

  createGeoPlane(xSize, ySize, planeMat){
    var planeGeometry = new THREE.PlaneBufferGeometry( xSize, ySize );
    var planeMesh = new THREE.Mesh( planeGeometry, planeMat );
    planeMesh.receiveShadow = true;
    this.scene.add( planeMesh );

    return planeMesh;
  },

  _createHotspot(hsName, x, y, z, xRot, labelText){
    //var geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    var geometry = new THREE.CylinderGeometry( 50, 50, 15, 32 );

    var material = new THREE.MeshStandardMaterial( {
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
    this.hotspots.push( mesh );
    
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
      position: new THREE.Vector3(0,0,0),
      setHTML: function(html) {
        this.element.innerHTML = html;
      },
      setParent: function(threejsobj) {
        this.parent = threejsobj;
      },
      updatePosition: function() {
        if(parent) {
          this.position.copy(this.parent.position);
        }
        
        var coords2d = this.get2DCoords(this.position, _this.camera);
        //console.log(coords2d.x + ", " + coords2d.y);
        this.element.style.left = (coords2d.x + 15) + 'px';
        this.element.style.top = (coords2d.y - 15 ) + 'px';
        //this.element.style.left = this.position.x + 15 + 'px';
        //this.element.style.top = this.position.y + 5 + 'px';
      },
      get2DCoords: function(position, camera) {
        var vector = position.project(camera);
        vector.x = (vector.x + 1)/2 * window.innerWidth;
        vector.y = -(vector.y - 1)/2 * window.innerHeight;
        return vector;
      }
    };
  },

  _createCanvasTexture(w, h, position, rotation){

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var cars = text.split("\n");

        for (var ii = 0; ii < cars.length; ii++) {

            var line = "";
            var words = cars[ii].split(" ");

            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + " ";
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width;

                if (testWidth > maxWidth) {
                    context.fillText(line, x, y);
                    line = words[n] + " ";
                    y += lineHeight;
                }
                else {
                    line = testLine;
                }
            }

            context.fillText(line, x, y);
            y += lineHeight;
        }
    };

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    var size = 14;
    var text = "Now is the time for all good men to come to the aid of their country.  The quick brown fox jumped over the lazy dog.";
    var maxWidth = 300;
    var lineHeight = 24;
    var x = 20; // (canvas.width - maxWidth) / 2;
    var y = 25;

    context.fillStyle = 'rgba(220,220,220,0.5)';
    context.fillRect(0, 0, 1000, 1000);
    context.font = size + "pt Lobster, cursive";
    context.textAlign = "left";
    context.fillStyle = 'rgb(20,20,20)';
    wrapText(context, text, x, y, maxWidth, lineHeight);

    var image = document.getElementById('source');
    context.drawImage(image, 50, 50, 150, 150);

    //context.fillText(text, canvas.width / 2, canvas.height / 2);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;


    var material = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      map: texture,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    });
    var geometry = new THREE.PlaneGeometry(w, h);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    mesh.rotation.x = rotation.x;
    mesh.rotation.y = rotation.y;
    mesh.rotation.z = rotation.z;

    sceneCreator.scene.add(mesh);
  },

  _createHTMLPlane(){

    function createCssRenderer() {
      var cssRenderer = new THREE.CSS3DRenderer();
      cssRenderer.setSize(window.innerWidth, window.innerHeight);
      cssRenderer.domElement.style.position = 'absolute';
      sceneCreator.renderer.domElement.style.zIndex = 0;
      cssRenderer.domElement.style.top = 0;
      return cssRenderer;
    }

    function createPlane(w, h, position, rotation) {
      var material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: false,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
      });
      var geometry = new THREE.PlaneGeometry(w, h);
      var mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = position.x;
      mesh.position.y = position.y;
      mesh.position.z = position.z;
      mesh.rotation.x = rotation.x;
      mesh.rotation.y = rotation.y;
      mesh.rotation.z = rotation.z;
      return mesh;
    }
    ///////////////////////////////////////////////////////////////////
    // Creates CSS object
    //
    ///////////////////////////////////////////////////////////////////
    function createCssObject(w, h, position, rotation, url) {
      var html = [
        '<div class="exClass" style="width:' + w + 'px; height:' + h + 'px;">',
        '<iframe src="' + url + '" width="' + w + '" height="' + h + '">',
        '</iframe>',
        '</div>'
      ].join('\n');
      var div = document.createElement('div');
      $(div).html(html);
      var cssObject = new THREE.CSS3DObject(div);
      cssObject.position.x = position.x;
      cssObject.position.y = position.y;
      cssObject.position.z = position.z;
      cssObject.rotation.x = rotation.x;
      cssObject.rotation.y = rotation.y;
      cssObject.rotation.z = rotation.z;
      return cssObject;
    }
    ///////////////////////////////////////////////////////////////////
    // Creates 3d webpage object
    //
    ///////////////////////////////////////////////////////////////////
    function create3dPage(w, h, position, rotation, url) {
      sceneCreator.canvasObject = createPlane(
          w, h,
          position,
          rotation);
      sceneCreator.scene.add(sceneCreator.canvasObject);
      sceneCreator.cssObject = createCssObject(
          w, h,
          position,
          rotation,
          url);
      sceneCreator.cssScene.add(sceneCreator.cssObject);
    }

    sceneCreator.cssRenderer = createCssRenderer();
    //document.body.appendChild(glRenderer.domElement);
    document.body.appendChild(sceneCreator.cssRenderer.domElement);
    sceneCreator.cssRenderer.domElement.appendChild(sceneCreator.renderer.domElement);
    //glScene = new THREE.Scene();
    sceneCreator.cssScene = new THREE.Scene();
    create3dPage(
      600, 600,
      new THREE.Vector3(650, 350, 0),
      new THREE.Vector3(0, 3.14, 0),
      'theContent.html');
    /*
    create3dPage(
      900, 1000,
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
      'http://adndevblog.typepad.com/cloud_and_mobile');
    create3dPage(
      1000, 1000,
      new THREE.Vector3(1050, 0, 400),
      new THREE.Vector3(0, -45 * Math.PI / 180, 0),
      'http://www.kitestringviz.com');
    */
  }
};

sceneCreator.container = document.getElementById('container');
sceneCreator.onReady();
window.addEventListener('resize', function() {
  sceneCreator.onResize();
}, false);