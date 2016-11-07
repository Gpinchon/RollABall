define (
	function (require) {
		Number.prototype.clamp = function(min, max) {
			return Math.min(Math.max(this, min), max);
		};
		Number.prototype.cycle = function(min, max) {
			return (this < min ? max : this > max ? min : this);
		};
		Number.prototype.normalize = function(min, max) {
			return ((this-min)/(max-min));
		};
		var BABYLON = require('babylon');
		var OIMO = require('oimo');
		var application = {
			engine: null,
			scene: null,
			playground: {
				ground: null,
				sphere: null
			},
			renderCanvas: null,
			sayHello: function () {
				console.log("Application says hello !");
			},
			initEngine: function (renderCanvas) {
				this.renderCanvas = renderCanvas;
				if (!this.engine)
					return (this.engine = new BABYLON.Engine(renderCanvas, true));
				return (this.engine);
			},
			getEngine : function () {
				return (this.engine);
			},
			getScene : function () {
				return (this.scene);
			},
			createPlayground : function (playgroundSize) {
				if (this.engine)
				{
					if (this.scene)
						this.scene.dispose();
					this.scene = new BABYLON.Scene(this.engine);
					this.scene.enablePhysics(new BABYLON.Vector3(0,-9.8, 0), new BABYLON.OimoJSPlugin());
					var i = 0;
					var borderOptions = [
							{width: playgroundSize, heigth: 1, depth: 1},
							{width: 1, heigth: 1, depth: playgroundSize},
						];
					var positions = [
						{x: 0, y: .5, z: -(playgroundSize / 2 - .5)},
						{x: 0, y: .5, z: (playgroundSize / 2 - .5)},
						{x: -(playgroundSize / 2 - .5), y: .5, z: 0},
						{x: (playgroundSize / 2 - .5), y: .5, z: 0}
					];
					this.playground.ground = new Array();
					var borderMaterial = new BABYLON.PBRMaterial("borders", this.scene);
					borderMaterial.microSurface = 0.6;
					borderMaterial.reflectivityColor = new BABYLON.Color3(0.2, 0.2, 0.2);
					borderMaterial.albedoColor = new BABYLON.Color3(.1, .1, .1);
					while (i < 4)
					{
						var border = BABYLON.MeshBuilder.CreateBox("border" + i, borderOptions[Math.floor(i / 2)], this.scene);
						border.position = new BABYLON.Vector3(positions[i].x, positions[i].y, positions[i].z);
						border.material = borderMaterial;
						this.playground.ground.push(border);
						i++;
					}
					i = 0;
					this.playground.ground.push(BABYLON.MeshBuilder.CreateGround("ground", {width: playgroundSize, height: playgroundSize, subdivsions: 1}, this.scene));
					this.playground.ground[4].material =  new BABYLON.PBRMaterial("tiling", this.scene);
					this.playground.ground[4].material.albedoTexture = new BABYLON.Texture("./res/tile.jpg", this.scene);
					this.playground.ground[4].material.albedoTexture.uScale = playgroundSize / 2;
					this.playground.ground[4].material.albedoTexture.vScale = playgroundSize / 2;
					this.playground.ground[4].material.bumpTexture = new BABYLON.Texture("./res/tileNorm.jpg", this.scene);
					this.playground.ground[4].material.bumpTexture.uScale = playgroundSize / 2;
					this.playground.ground[4].material.bumpTexture.vScale = playgroundSize / 2;
					this.playground.ground[4].material.reflectivityColor = new BABYLON.Color3(0.5, 0.5, 0.5);
					this.playground.ground[4].material.microSurface = 0.8;
					while (i < 5)
					{
						this.playground.ground[i].setPhysicsState({impostor: BABYLON.PhysicsEngine.BoxImpostor, move:false});
						this.playground.ground[i].applyGravity = false;
						this.playground.ground[i].checkCollisions = true;
						i++;
					}
					this.playground.sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1}, this.scene);
					this.playground.sphere.checkCollisions = true;
					this.scene.activeCamera = new BABYLON.ArcRotateCamera("mainCamera", 0, 1, 10, this.playground.sphere, this.scene);
					this.playground.sphere.material = new BABYLON.PBRMaterial("sphere", this.scene);
					this.playground.sphere.material.microSurface = 0.6;
					this.playground.sphere.material.reflectivityColor = new BABYLON.Color3(0.5, 0.5, 0.5);
					this.playground.sphere.material.albedoColor = new BABYLON.Color3(1, 0, 0);
					this.playground.sphere.material.reflectionColor = new BABYLON.Color3(1.0, 1.0, 1.0);
					var probe = new BABYLON.ReflectionProbe("main", 512, this.scene);
					probe.renderList.push.apply(probe.renderList, this.playground.ground);
					probe.attachToMesh(this.playground.sphere);
					this.playground.sphere.probe = probe;
					this.playground.sphere.material.reflectionTexture = probe.cubeTexture;
					this.playground.sphere.position.y = 2;
					this.playground.sphere.applyGravity = true;
					this.playground.sphere.setPhysicsState({impostor: BABYLON.PhysicsEngine.BoxImpostor, move:true, mass:1, friction:0.2, restitution:1});
					/*this.scene.activeCamera.attachControl(this.renderCanvas, false, true);
					this.scene.activeCamera.keysUp.pop();
					this.scene.activeCamera.keysDown.pop();
					this.scene.activeCamera.keysLeft.pop();
					this.scene.activeCamera.keysRight.pop();*/
					console.log(this.scene.activeCamera);
					new BABYLON.HemisphericLight("light",  new BABYLON.Vector3(0, .5, -.5), this.scene);
					var engine = this.engine;
					window.addEventListener("resize", function () {
						engine.resize();
					});
					return (this.scene);
				}
			},
			initRendering : function () {
				if (this.engine && this.scene)
				{
					var scene = this.scene;
					var player = this.playground.sphere;
					var keys = {};
					function updateKeys(event) {
						keys[event.code] = event.type == 'keydown';
					}
					BABYLON.Tools.RegisterTopRootEvents([
						{
							name: "keydown",
							handler: updateKeys
						},
						{
							name: "keyup",
							handler: updateKeys
						}
					]);
					this.scene.registerBeforeRender(function () {
						var finalVelocity = player.physicsImpostor.getLinearVelocity();
						if (keys["ArrowLeft"])
							finalVelocity.z -= finalVelocity.z > -0.2 ? .1 : 0;
						if (keys["ArrowRight"])
							finalVelocity.z += finalVelocity.z < 0.2 ? .1 : 0;
						if (keys["ArrowUp"])
							finalVelocity.x -= finalVelocity.x > -0.2 ? .1 : 0;
						if (keys["ArrowDown"])
							finalVelocity.x += finalVelocity.x < 0.2 ? .1 : 0;
						scene.activeCamera.alpha = scene.activeCamera.alpha.cycle(-2 * Math.PI, 2 * Math.PI);
						player.physicsImpostor.setLinearVelocity(finalVelocity, player.getAbsolutePosition());
					});
					this.engine.runRenderLoop(function () {
						scene.render();
					});
				}
			}
		}
		return (application);
	}
);
