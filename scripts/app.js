define (
	function (require) {
		require('babylon');
		require('cannon');
		var interface = require('interface');
		Number.prototype.clamp = function(min, max) {
			return Math.min(Math.max(this, min), max);
		};
		Number.prototype.cycle = function(min, max) {
			return (this < min ? max : this > max ? min : this);
		};
		Number.prototype.normalize = function(min, max) {
			return ((this-min)/(max-min));
		};
		function initCamera(scene, target, canvas) {
			scene.activeCamera = new BABYLON.ArcRotateCamera("mainCamera", 1, 1, 10, target, scene);
			scene.activeCamera.attachControl(canvas, false);
			scene.activeCamera.zoomOnFactor = .005;
			scene.activeCamera.wheelPrecision = 10;
			scene.activeCamera.upperAlphaLimit = 0;
			scene.activeCamera.lowerAlphaLimit = 0;
			scene.activeCamera.upperBetaLimit = 3.14;
			scene.activeCamera.lowerBetaLimit = 0;
			scene.activeCamera.upperRadiusLimit = 10;
			scene.activeCamera.lowerRadiusLimit = 0;
			scene.activeCamera.panningSensibility = 0.5;
			scene.activeCamera.checkCollisions = true;
			scene.activeCamera.collisionRadius = new BABYLON.Vector3(1, 1, 1);
			scene.activeCamera.keysUp.pop();
			scene.activeCamera.keysDown.pop();
			scene.activeCamera.keysLeft.pop();
			scene.activeCamera.keysRight.pop();
		}
		var application = {
			engine: null,
			scene: null,
			keys: {},
			playground: {
				ground: null,
				sphere: null,
				size: null
			},
			renderCanvas: null,
			initEngine : function (renderCanvas) {
				interface.initUI(this);
				var	app = this;
				this.renderCanvas = renderCanvas;
				if (!this.engine)
					this.engine = new BABYLON.Engine(renderCanvas, true)
				window.addEventListener("resize", function () {
					app.engine.resize();
				});
				function updateKeys(event) {
					if (event.key == "Escape" && event.type == "keydown")
					{
						if (interface.menu.visible)
							interface.menu.makeInvisible(true);
						else
							interface.menu.makeVisible(true);
					}
					app.keys[event.key] = event.type == 'keydown';
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
					interface.initScores();
					if (this.scene)
						this.scene.dispose();
					this.scene = new BABYLON.Scene(this.engine);
					this.scene.enablePhysics(new BABYLON.Vector3(0,-9.8, 0), new BABYLON.CannonJSPlugin());
					var borderOptions = [
							{width: playgroundSize},
							{depth: playgroundSize},
						];
					var positions = [
						{x: 0, y: 5, z: -(playgroundSize / 2 - .5)},
						{x: 0, y: 5, z: (playgroundSize / 2 - .5)},
						{x: -(playgroundSize / 2 - .5), y: 5, z: 0},
						{x: (playgroundSize / 2 - .5), y: 5, z: 0}
					];
					this.playground.size = playgroundSize;
					this.playground.ground = new Array();
					var	skybox = BABYLON.Mesh.CreateBox("skyBox", 100.0, this.scene);
					skybox.infiniteDistance = true;
					skybox.renderingGroupId = 0;
					var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
					skybox.material = skyboxMaterial;
					skyboxMaterial.backFaceCulling = false;
					skyboxMaterial.disableLighting = true;
					skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
					skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
					skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./res/skybox/skybox", this.scene);
					skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
					var reflTexture = new BABYLON.CubeTexture("./res/skybox/skybox", this.scene);
					reflTexture.name = "reflTexture";
					var borderMaterial = new BABYLON.PBRMaterial("borders", this.scene);
					borderMaterial.microSurface = 0.6;
					borderMaterial.reflectivityColor = new BABYLON.Color3(0.2, 0.2, 0.2);
					borderMaterial.albedoColor = new BABYLON.Color3(.1, .1, .1);
					for (var i = 0;i < 4;i++)
					{
						this.playground.ground.push(BABYLON.MeshBuilder.CreateBox("border" + i, borderOptions[Math.floor(i / 2)], this.scene));
						this.playground.ground[i].scaling.y = 10;
						this.playground.ground[i].position = new BABYLON.Vector3(positions[i].x, positions[i].y, positions[i].z);
						this.playground.ground[i].material = borderMaterial;
					}
					var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: playgroundSize, height: playgroundSize, subdivsions: 1}, this.scene);
					ground.material =  new BABYLON.PBRMaterial("tiling", this.scene);
					ground.material.albedoTexture = new BABYLON.Texture("./res/wood.jpg", this.scene);
					ground.material.bumpTexture = new BABYLON.Texture("./res/woodNorm.jpg", this.scene);
					ground.material.albedoTexture.uScale = ground.material.bumpTexture.uScale = playgroundSize / 4;
					ground.material.albedoTexture.vScale = ground.material.bumpTexture.vScale = playgroundSize / 4;
					ground.material.reflectivityColor = new BABYLON.Color3(0.5, 0.5, 0.5);
					ground.material.reflectionTexture = new BABYLON.MirrorTexture("groundMirror", 256, this.scene, true);
					ground.material.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1.0, 0, 0);
					ground.material.microSurface = 0.8;
					ground.material.reflectionTexture.renderList.push.apply(ground.material.reflectionTexture.renderList, this.playground.ground);
					ground.material.reflectionTexture.renderList.push(skybox);
					this.playground.ground.push(ground);
					for (var i = 0;i < 5;i++)
					{
						this.playground.ground[i].setPhysicsState({impostor:BABYLON.PhysicsEngine.BoxImpostor, move:false, restitution:0.5});
						this.playground.ground[i].applyGravity = false;
						this.playground.ground[i].checkCollisions = true;
						this.playground.ground[i].receiveShadows = true;
					}
					this.playground.ground.push(skybox);
					this.playground.sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1}, this.scene);
					initCamera(this.scene, this.playground.sphere, this.renderCanvas);
					this.playground.sphere.checkCollisions = false;
					this.playground.sphere.applyGravity = true;
					this.playground.sphere.position.y = 1;
					this.playground.sphere.material = new BABYLON.PBRMaterial("sphere", this.scene);
					this.playground.sphere.material.microSurface = 0.6;
					this.playground.sphere.material.reflectivityColor = new BABYLON.Color3(0.5, 0.5, 0.5);
					this.playground.sphere.material.albedoColor = new BABYLON.Color3(1, 0, 0);
					this.playground.sphere.material.reflectionColor = new BABYLON.Color3(1.0, 1.0, 1.0);
					this.playground.sphere.setPhysicsState({impostor: BABYLON.PhysicsEngine.SphereImpostor, move:true, mass:5, friction:0.8, restitution:0.5});
					var probe = new BABYLON.ReflectionProbe("sphereProbe", 256, this.scene);
					probe.renderList.push.apply(probe.renderList, this.playground.ground);
					probe.attachToMesh(this.playground.sphere);
					this.playground.sphere.material.bumpTexture = new BABYLON.Texture("./res/scratchNorm.jpg", this.scene);
					this.playground.sphere.material.reflectionTexture = probe.cubeTexture;
					this.playground.sphere.material.refractionTexture = probe.cubeTexture;
					this.playground.sphere.receiveShadows = true;
					var	bonus = new Array();
					for (var i = 0;i < playgroundSize;i++)
					{
						if (Math.random() > 0.5)
						{
							var size = Math.random().clamp(0.5, 1);
							bonus.push(BABYLON.MeshBuilder.CreateBox("bonus" + i, {size: size}, this.scene));
							bonus[i].setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {move:true, mass:size, friction:0.2, restitution:1});
							bonus[i].scoreValue = parseInt(1 / size * 100);
							bonus[i].size = size;
						}
						else
						{
							var diameter = Math.random().clamp(0.5, 1);
							bonus.push(BABYLON.MeshBuilder.CreateSphere("bonus" + i, {diameter: diameter}, this.scene));
							bonus[i].setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {move:true, mass:diameter, friction:0.2, restitution:1});
							bonus[i].scoreValue = parseInt(1 / diameter * 1000);
							bonus[i].size = diameter;
						}
						bonus[i].checkCollisions = false;
						bonus[i].applyGravity = true;
						bonus[i].material = new BABYLON.PBRMaterial("bonus" + i + "mtl", this.scene);
						bonus[i].material.microSurface = Math.random();
						bonus[i].material.indexOfRefraction = Math.random();
						bonus[i].material.linkRefractionWithTransparency = true;
						bonus[i].material.alpha = Math.random();
						bonus[i].material.emissiveColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
						bonus[i].material.reflectivityColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
						bonus[i].material.reflectionColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
						bonus[i].material.albedoColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
						bonus[i].material.reflectionTexture = reflTexture;
						bonus[i].material.refractionTexture = reflTexture;
						bonus[i].position = new BABYLON.Vector3((Math.random() - .5) * (playgroundSize / 2), 2, (Math.random() - .5) * (playgroundSize / 2));
						bonus[i].scoreValue = parseInt(Math.random() * 100);
						bonus[i].receiveShadows = true;
						var scene = this.scene;
						bonus[i].physicsImpostor.registerOnPhysicsCollide(this.playground.sphere.physicsImpostor, function(main, collided){
							var reflectionTexture = collided.object.material.reflectionTexture;
							var bumpTexture = collided.object.material.bumpTexture;
							collided.object.material.dispose();
							collided.object.material = main.object.material.clone("bonus" + bonus.indexOf(main) + "mtl_clone");
							collided.object.material.reflectionTexture = reflectionTexture;
							collided.object.material.refractionTexture = reflectionTexture;
							collided.object.material.bumpTexture = bumpTexture;
							main.object.registerAfterRender(function(main){
								bonus.splice(bonus.indexOf(main), 1);
								interface.updateScore(main.scoreValue);
								interface.updateBonus(bonus.length);
								main.dispose();
							});
						});
					}
					interface.updateBonus(bonus.length);
					ground.material.reflectionTexture.renderList.push.apply(ground.material.reflectionTexture.renderList, bonus);
					ground.material.reflectionTexture.renderList.push(this.playground.sphere);
					probe.renderList.push.apply(probe.renderList, bonus);
					var light = new BABYLON.DirectionalLight("light",  new BABYLON.Vector3(-1, -1, -1), this.scene);
					light.autoUpdateExtends = false;
					var groundLight = new BABYLON.HemisphericLight("fillLight",  new BABYLON.Vector3(-1, -1, -1), this.scene);
					groundLight.indensity = 0.001;
					groundLight.specular = new BABYLON.Color3(0, 0, 0);
					var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
					shadowGenerator.getShadowMap().renderList.push.apply(shadowGenerator.getShadowMap().renderList, bonus);
					shadowGenerator.getShadowMap().renderList.push(this.playground.ground[0], this.playground.ground[1], this.playground.ground[2], this.playground.ground[3]);
					shadowGenerator.getShadowMap().renderList.push(this.playground.sphere);
					shadowGenerator.bias = 0.00001;
					shadowGenerator.useVarianceShadowMap  = false;
					shadowGenerator.usePoissonSampling = true;
					var topCollider = BABYLON.MeshBuilder.CreatePlane("topCollider", {size: playgroundSize}, this.scene);
					topCollider.rotate(BABYLON.Axis.X, -1.5, BABYLON.Space.LOCAL);
					topCollider.position.y = 9.5;
					topCollider.visibility = false;
					topCollider.setPhysicsState({impostor: BABYLON.PhysicsEngine.BoxImpostor, move:false});
					return (this.scene);
				}
			},
			initRendering : function () {
				if (this.engine && this.scene)
				{
					var app = this;
					var player = this.playground.sphere;
					var	moveVertical = 0;
					var moveHorizontal = 0;
					this.scene.registerBeforeRender(function () {
						moveHorizontal = moveVertical = 0;
						if (app.keys["Left"] || app.keys["ArrowLeft"])
							moveHorizontal ++;
						if (app.keys["Right"] || app.keys["ArrowRight"])
							moveHorizontal --;
						if (app.keys["Up"] || app.keys["ArrowUp"])
							moveVertical ++;
						if (app.keys["Down"] || app.keys["ArrowDown"])
							moveVertical --;
						if (moveHorizontal || moveVertical)
						{
							var campos = app.scene.activeCamera.position;
							var finalVelocity = player.physicsImpostor.getLinearVelocity();
							var	forward = (player.position.subtract(new BABYLON.Vector3(campos.x, player.position.y, campos.z)).normalize());
							var right = BABYLON.Vector3.Cross(forward, new BABYLON.Vector3(0, 1, 0));
							forward = forward.scale(moveVertical).scale(0.1);
							right = right.scale(moveHorizontal).scale(0.1);
							finalVelocity = finalVelocity.add(forward);
							finalVelocity = finalVelocity.add(right);
							finalVelocity.x = finalVelocity.x.clamp(-4, 4);
							finalVelocity.z = finalVelocity.z.clamp(-4, 4);
							player.physicsImpostor.setLinearVelocity(finalVelocity, player.getAbsolutePosition());
						}
					});
					this.scene.executeWhenReady(function () {
						app.engine.runRenderLoop(function () {
							app.scene.render();
						});
					});
					var wrongFrames = 0;
					this.scene.afterRender = function () {
						var fps = app.engine.getFps();
						wrongFrames++;
						if (wrongFrames <= 60)
							return ;
						var ReplaceReflectionTextures = new BABYLON.SceneOptimization(3);
						ReplaceReflectionTextures.apply = function (scene)
						{
							if (!scene.isReady())
								return (false);
							var	reflTexture;
							for (var i = 0; i < scene.textures.length; i++) {
								if (scene.textures[i].name == "reflTexture")
								{
									reflTexture = scene.textures[i];
									break ;
								}
							};
							scene.materials.forEach(function (material) {
								if (material.reflectionTexture != undefined
								&& material.reflectionTexture.name != "reflTexture")
								{
									material.reflectionTexture.dispose();
									material.reflectionTexture = reflTexture;
								}
								if (material.refractionTexture != undefined
								&& material.refractionTexture.name != "reflTexture")
								{
									material.refractionTexture.dispose();
									material.refractionTexture = reflTexture;
								}
							});
							return (true);
						};
						var result = new BABYLON.SceneOptimizerOptions(24, 5000);
						result.optimizations.push(ReplaceReflectionTextures);
						result.optimizations.push(new BABYLON.HardwareScalingOptimization(0, 4));
						result.optimizations.push(new BABYLON.TextureOptimization(1, 512));
						result.optimizations.push(new BABYLON.TextureOptimization(2, 256));
						BABYLON.SceneOptimizer.OptimizeAsync(app.scene, result);
						app.scene.afterRender = null;
					}
				}
			}
		}
		return (application);
	}
);
