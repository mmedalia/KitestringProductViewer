var modelLoader = {

  // variables
  sceneSettings: false,
  loadedMaterials : [],

  onReady: function() {
    
  },

  loadModels(){

    if(sceneCreator.sceneSettings == null) return;

    console.log("Loading Models.");

    //console.log("Collada Models : " + sceneCreator.sceneSettings.media.colladaModels.length);
    var theModels = sceneCreator.sceneSettings.media.colladaModels;
    for (var i = theModels.length - 1; i >= 0; i--) {
      this.loadModel(i, sceneCreator.scene, function(theDAE, theScene){
        document.getElementById("progressBar").style.visibility = "hidden";
        theScene.add(theDAE);
        //sceneCreator.sceneLoaded();
      });
    }

    /*
    var modelPath = "models/BarCabinet2/bar_cabinet.dae";
    this.loadModel(modelPath, sceneCreator.scene, function(theDAE, theScene){
      document.getElementById("progressBar").style.visibility = "hidden";
      theScene.add(theDAE);
      //sceneCreator.sceneLoaded();
    });

    
    var roomPath = "models/WhiteRoom/WhiteRoom.dae";
    this.loadModel(roomPath, this.scene, function(theDAE, theScene){
      document.getElementById("progressBar").style.visibility = "hidden";
      theScene.add(theDAE);
    });
    */

  },

  loadModel(modelIndex, theScene, callback){
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    var theModels = sceneCreator.sceneSettings.media.colladaModels;
    loader.load( theModels[modelIndex].path, function ( collada ) {

      dae = collada.scene;

      dae.traverse( function ( child ) {
        
        //LOOP THROUGH MODEL OBJECTS        
        modelLoader._findObjectModifications(child, theModels[modelIndex]);

        //LOOP THROUGH MODEL MATERIALS
        if ( child instanceof THREE.Mesh ) {
          var textureLoader = new THREE.TextureLoader();
          if(child.material.type == "MultiMaterial"){
            for (var m = 0; m < child.material.materials.length; m++) {
              modelLoader._findMaterialsToEdit(child.material.materials[m], theModels[modelIndex]);
            }
          }else{
            modelLoader._findMaterialsToEdit(child.material, theModels[modelIndex]);
          }
          
        }

        //SET MODEL POS, ROT, SCALE
        dae.position.set(theModels[modelIndex].position.x, theModels[modelIndex].position.y, theModels[modelIndex].position.z);
        dae.rotation.set(theModels[modelIndex].rotation.x, theModels[modelIndex].rotation.y, theModels[modelIndex].rotation.z);
        dae.scale.x = dae.scale.y = dae.scale.z = theModels[modelIndex].scale;
        dae.updateMatrix();

      }, function(progress){
        //console.log(progress);
        //var loadPercent = progress.loaded/progress.total;
        //console.log(loadPercent + "%");
      });

      callback(dae, theScene);

    }, function(progress){
      //console.log(progress);
      var loadPercent = progress.loaded/progress.total;
      modelLoader._progressBar(loadPercent);
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

  _findObjectModifications(obj, objSettings){

    //console.log("Collada Model - Object : " + obj.name);

    if ( obj instanceof THREE.Mesh ) {
      if(objSettings.castShadow != null){
        //console.log("Setting castShadow");
        obj.castShadow = true;
      }
      
      if(objSettings.receiveShadow != null){
        obj.receiveShadow = true;
      }
    }

    //FUNCTIONS TO RUN CUSTOM MODIFICATIONS TO OBJECTS
    try{
      productInfo._findObjectModifications(obj, objSettings);
    }catch(err){
      //console.log("No custom mods found");
    }
    
  },

  _findMaterialsToEdit(theMaterial, modelSettings){

    //console.log("Collada Model - Material : " + theMaterial.name + " of type : " + theMaterial.type);

    //CHECK IF THE MATERIALS HAS BEEN UPDATED ALREADY
    for (var i = modelLoader.loadedMaterials.length - 1; i >= 0; i--) {
      if(modelLoader.loadedMaterials[i] == theMaterial.name){
        return;
      }
    }

    //CHECK FOR MATERIAL SETTINGS TO UPDATE
    //console.log("Processing material : " + theMaterial.name);
    for (var i = modelSettings.modMaterials.length - 1; i >= 0; i--) {
      //console.log("Materials to modify: " + modelSettings.modMaterials[i].name);
      if(theMaterial.name == modelSettings.modMaterials[i].name){
          
          if(modelSettings.modMaterials[i].textureMap != null){
            var tMapImage = modelSettings.texturePath + modelSettings.modMaterials[i].bumpMap;
            modelLoader._addTextureMap(theMaterial, modelSettings.modMaterials[i]);
          }

          if(modelSettings.modMaterials[i].bumpMap != null){
            var bumpMapImage = modelSettings.texturePath + modelSettings.modMaterials[i].bumpMap;
            modelLoader._addBumpMap(theMaterial, modelSettings.modMaterials[i]);
          }

          if(modelSettings.modMaterials[i].diffuseColor != null){
            theMaterial.color.set(modelSettings.modMaterials[i].diffuseColor);
            //theMaterial.color = modelSettings.modMaterials[i].diffuseColor;
          }

          if(modelSettings.modMaterials[i].emissiveColor != null){
            theMaterial.emissive = modelSettings.modMaterials[i].emissiveColor;
          }

          if(modelSettings.modMaterials[i].emissiveIntensity != null){
            //theMaterial.emissive = modelSettings.modMaterials[i].emissiveColor;
            theMaterial.emissiveIntensity = modelSettings.modMaterials[i].emissiveIntensity;
          }

          if(modelSettings.modMaterials[i].envMap != null){
              modelLoader._addEnvMap(theMaterial);
          }

          theMaterial.needsUpdate = true;

          modelLoader.loadedMaterials.push(theMaterial.name);
      }
    }

  },

  _addEnvMap(theMaterial){
    
    theMaterial.envMap = sceneCreator.relectiveMap;
    theMaterial.reflectivity = 0.5;
    theMaterial.needsUpdate = true;

  },

  _addTextureMap(theMaterial, materialSettings){
    
    var texturePath = materialSettings.texturePath + materialSettings.textureMap;
    var textureLoader = new THREE.TextureLoader();
    textureLoader.load( texturePath, function( map ) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = materialSettings.anisotropy;
      map.repeat.set( materialSettings.xRep, materialSettings.yRep );
      theMaterial.map = map;
      theMaterial.needsUpdate = true;
      //console.log("Added TextureMap : " + texturePath);
    } );

  },

  _addBumpMap(theMaterial, materialSettings){
    //console.log("Enhacing material : " + theMaterial.name);
    var textureLoader = new THREE.TextureLoader();
    theMaterial.bumpScale = materialSettings.bumpScale;
    textureLoader.load( materialSettings.bumpMap, function( map ) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      theMaterial.bumpMap = map;
      theMaterial.needsUpdate = true;
    } );
  },



}