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
	app.initEngine(document.getElementById('renderCanvas'));
	app.createPlayground(50);
	app.initRendering();
});
