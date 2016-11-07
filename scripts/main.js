require.config({
	paths: {
		jquery : 'libs/jquery',
		babylon : 'libs/babylon',
		oimo : 'libs/oimo.min'
	},
	shim: {
		babylon: {
			exports: 'BABYLON'
		},
		oimo: {
			exports: 'OIMO'
		}
	}
});

require(['app', 'jquery', 'babylon', 'oimo'], function (app, jQuery, babylon, oimo) {
	app.sayHello();
	app.initEngine(document.getElementById('renderCanvas'));
	app.createPlayground(20);
	app.initRendering();
});
