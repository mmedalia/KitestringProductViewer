var sceneInterface = {

    canvases: [],

    _createHTMLPlane(w, h, position, rotation, htmlSource) {

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
                opacity: 0.0,
                side: THREE.DoubleSide
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
                '<div style="width:' + w + 'px; height:' + h + 'px;">',
                '<iframe id="cssObjIframe" src="' + url + '" width="' + w + '" height="' + h + '">',
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

        //CHECK TO SEE IF THE CSS SCENE AND RENDERER HAS BEEN CREATED.
        //IF NOT CREATE THEM
        if((sceneCreator.cssRenderer == null) || (sceneCreator.cssRenderer == false)){
            console.log("Creating CSS Scene");
            sceneCreator.cssRenderer = createCssRenderer();
            document.body.appendChild(sceneCreator.cssRenderer.domElement);
            sceneCreator.cssRenderer.domElement.appendChild(sceneCreator.renderer.domElement);
            sceneCreator.cssScene = new THREE.Scene();
        }else{
            console.log("CSS Scene already created.");
        }

        create3dPage( w, h, position, rotation, htmlSource);

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
}