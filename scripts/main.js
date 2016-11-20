require.config({
	paths: {
		jquery : 'libs/jquery',
		babylon : 'libs/babylon.custom',
		cannon : 'libs/cannon.min'
	},
	shim: {
		babylon: {
			exports: 'BABYLON'
		},
		cannon: {
			exports: 'CANNON'
		}
	}
});

require(['app'], function (app) {
	app.InitEngine(document.getElementById('renderCanvas'));
	app.CreatePlayground(25);
	app.initRendering();
});
