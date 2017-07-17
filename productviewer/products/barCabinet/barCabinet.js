var productInfo = {

  // variables
  doorsOpen: false,
  rightDoor: false,
  leftDoor: false,
  drawersOpen: false,
  topDrawer: false,
  bottomDrawer: false,

  sceneSettings : {
      name: "Bar Cabinet",
      controlType: "orbit",
      renderType: "standard",
      renderer: {
          params: {
              alpha: true,
              antialias: true,
          },
          shadowMapEnabled: true,
      },
      stereoView: true,
      backgroundColor: 0xECF8FF,
      camera: {
          position: {
              x: 0,
              y: 100,
              z: -350
          },
          fov: 60,
          near: 0.1,
          far: 10000,
          focus: 50, //DEFAULT
          zoom: 1,
      },
      controls: {
          target: {
              x: 0,
              y: 300,
              z: 0
          },
          minDistance: 5,
          maxDistance: 800,
          maxPolarAngle: (Math.PI / 1.8),
          enableDamping: true,
          dampingFactor: 0.25,
          enableZoom: true,
          enablePan: true,
          enableKeyS: false,
      },
      lighting: {
          lights: [{
                  name: "Light01",
                  type: "ambient",
                  color: 0xffffff,
                  intensity: 0.3,
              },
              {
                  name: "Light02",
                  type: "directional",
                  color: 0xffffff,
                  intensity: 0.75,
                  position: {
                      x: -418,
                      y: 1000,
                      z: -775,
                  },
              },
              {
                  name: "Light03",
                  type: "spot",
                  addHelper: true,
                  color: 0xcccccc,
                  position: {
                      x: -200,
                      y: 500,
                      z: -500
                  },
                  intensity: 0.4,
                  angle: (Math.PI / 6.5),
                  penumbra: 0.25,
                  decay: 1.3,
                  distance: 2000,
                  castShadow: true,
                  shadowDarkness: 0.25,
                  //shadow.mapSize.width = 1024;
                  //shadow.mapSize.height = 1024;
                  //shadow.camera.near = 10;
                  //shadow.camera.far = 10000;
              },
              {
                  name: "Light03",
                  type: "spot",
                  addHelper: true,
                  color: 0xff0000,
                  position: {
                      x: 400,
                      y: 500,
                      z: -500
                  },
                  intensity: 0.4,
                  angle: (Math.PI / 6.5),
                  penumbra: 0.25,
                  decay: 1.3,
                  distance: 2000,
                  castShadow: true,
                  shadowDarkness: 0.25,
                  //shadow.mapSize.width = 1024;
                  //shadow.mapSize.height = 1024;
                  //shadow.camera.near = 10;
                  //shadow.camera.far = 10000;
              },
          ],
      },
      media: {
          envMapPath: "models/BarCabinet2/textures/SwedishRoyalCastle/",
          envMapFormat: ".jpg",
          colladaModels: [{
                  name: "BarCabinet",
                  path: "models/BarCabinet2/bar_cabinet.dae",
                  texturePath: "models/BarCabinet2/textures/",
                  castShadow: true,
                  scale: 300.0,
                  position: {
                      x: 0,
                      y: 100,
                      z: 0
                  },
                  rotation: {
                      x: 0,
                      y: 0,
                      z: 0
                  },
                  modModel: [],
                  modMaterials: [
                      {
                          name: "M_bar_canvas",
                          bumpMap: "models/BarCabinet2/textures/FabricPlain0007_3_S_nrml.png",
                          bumpScale: 0.005,
                      },
                      {
                          name: "M_bar_wood",
                          diffuseColor: 0x8B4513,
                          bumpMap: "models/BarCabinet2/textures/WoodFine0007_seamless_M_nrml.png",
                          bumpScale: 0.005,
                      },
                      {
                          name: "M_bar_shelves_wood",
                          diffuseColor: 0x8B4513,
                          bumpMap: "models/BarCabinet2/textures/WoodFine0007_seamless_M_nrml.png",
                          bumpScale: 0.005,
                      },
                      {
                          name: "M_bar_hinges",
                          envMap: true,
                      },
                      {
                          name: "M_bar_casters",
                          envMap: true,
                      },
                      {
                          name: "M_bar_brass",
                          envMap: true,
                      }
                  ]
              },
              {
                  name: "WhiteRoom",
                  path: "models/WhiteRoom/WhiteRoom.dae",
                  texturePath: "models/WhiteRoom/textures/",
                  castShadow: true,
                  receiveShadow: true,
                  scale: 300.0,
                  position: {
                      x: -500,
                      y: 100,
                      z: -674
                  },
                  rotation: {
                      x: 0,
                      y: 0,
                      z: 0
                  },
                  modMaterials: [
                    {
                      name: "M_White_Base",
                      modifyMat: true,
                      diffuseColor: 0xffffff,
                      emissiveColor: 0x000000,
                      emissiveIntensity : 0,
                      metalness: 0.8,
                    },
                    {
                      name: "M_White_Floor",
                      diffuseColor: 0xFFFFFF,
                      emissiveColor: 0x000000,
                      emissiveIntensity : 0.25,
                      texturePath: "models/WhiteRoom/textures/",
                      textureMap: "Floor_Wood_1k.png",
                      xRep: 5,
                      yRep: 5,
                      anisotropy: 4,
                    }
                  ],
              },
          ]
      },
      interface: {
        canvases: [
          {
            name: "Main Canvas",
            size: {w: 250, h: 150},
            position: { x: 0, y: 375, z: 0},
            rotation: {x: 0, y: (Math.PI), z: 0},
            htmlSource: "uiContent.html#ele=callout1",
          },
          {
            name: "Canvas Num 2",
            size: {w: 250, h: 150},
            position: { x: 250, y: 375, z: -75},
            rotation: {x: 0, y: (Math.PI * -0.75), z: 0},
            htmlSource: "uiContent.html#ele=callout3",
          }
        ],
      },
  },

  initProductFunctions: function() {
    //console.log("loaded the product file");

      //HANDLE KEYPRESSES
    $(document).keypress(function(e) {
        e.preventDefault();
        //console.log("BAR - Keypress: " + e.charCode + ", " + e.which);
        var theKey = e.which;
        switch (e.which) {

            //Q-KEY
            case 113:
                //do something
                break;

            //W-KEY
            case 119:
                $("#cssObjIframe").contents().find("#callout1").css("display", "none");
                $("#cssObjIframe").contents().find("#callout2").css("display", "block");
                
                break;

            case 49:
              $("#cssObjIframe").attr("src", "http://kitestringviz.com");
            break;

        }
    });
  },

  handleRaycast(hitObjectName){

    //console.log("Handling raycast click for " + hitObjectName);
    switch (hitObjectName) {
        case "Doors":

            if (!this.doorsOpen) {
                this.doorsOpen = true;
                this._openDoors();
                if (sceneCreator.sceneSettings.renderType != "stereo") {
                    document.getElementById("Drawers").style.visibility = "visible";
                }
            } else {
                if (this.drawersOpen) {
                    this.drawersOpen = false;
                    this._closeDrawers();
                }
                this.doorsOpen = false;
                this._closeDoors();
                document.getElementById("Drawers").style.visibility = "hidden";
            }

            break;

        case "Drawers":

            if (this.doorsOpen) {
                if (!this.drawersOpen) {
                    this.drawersOpen = true;
                    this._openDrawers();
                } else {
                    this.drawersOpen = false;
                    this._closeDrawers();
                }
            }

            break;
    }

  },

  _findObjectModifications(obj, objSettings){

    if(obj.name.toLowerCase().includes("light")){
      //console.log("HIDING CHILD : " + obj.name);
      obj.visible = false;
    }

    //console.log("Setting Global Product Assemblies - " + obj.name);
    if(obj.name != ""){
      switch(obj.name){
        case "L_door_ROT":
          this.leftDoor = obj;
        break;

        case "R_door_ROT":
          this.rightDoor = obj;
        break;

        case "drawer_01":
          this.topDrawer = obj;
        break;

        case "drawer_02":
          this.bottomDrawer = obj;
        break;

        case "enviro_LittleTable":
          obj.visible = false;
        break;

        case "enviro_Floor":
          this.theFloor = obj;
        break;
      }
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
        productInfo.rightDoor.rotation.y = rDoorStart.y;
    });

    var tweenLeft = new TWEEN.Tween(lDoorStart).to(lDoorStop, 2000);
    tweenLeft.onUpdate(function(){
        productInfo.leftDoor.rotation.y = lDoorStart.y;
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
        productInfo.rightDoor.rotation.y = rDoorStart.y;
    });

    var tweenLeft = new TWEEN.Tween(lDoorStart).to(lDoorStop, 2000);
    tweenLeft.onUpdate(function(){
        productInfo.leftDoor.rotation.y = lDoorStart.y;
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
        productInfo.topDrawer.position.z = tdStart.z;
    });

    var tweenBottom = new TWEEN.Tween(bdStart).to(bdStop, 2000);
    tweenBottom.onUpdate(function(){
        productInfo.bottomDrawer.position.z = bdStart.z;
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
        productInfo.topDrawer.position.z = tdStart.z;
    });

    var tweenBottom = new TWEEN.Tween(bdStart).to(bdStop, 2000);
    tweenBottom.onUpdate(function(){
        productInfo.bottomDrawer.position.z = bdStart.z;
    });
    tweenTop.start();
    tweenBottom.start();

  },
}