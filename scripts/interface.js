define(['jquery'],	function($) {
		class InterfaceElement {
			constructor(id) {
				this.html = $(".interface#" + id);
				this.numbers = this.html.children(".number");
				this.texts = this.html.children(".text");
				this.visible = true;
			};
			makeVisible(applyToChildren) {
				if (!this.visible) {
					this.visible = true;
					this.html.removeClass("invisible");
					if (applyToChildren == true)
						this.makeChildrenVisible();
				}
			};
			makeInvisible(applyToChildren) {
				if (this.visible) {
					this.visible = false;
					this.html.addClass("invisible");
					if (applyToChildren == true)
						this.makeChildrenInvisible();
				}
			};
			makeChildrenVisible() {
				this.html.children().removeClass("invisible");
			};
			makeChildrenInvisible() {
				this.html.children().addClass("invisible");
			};
			setInnerHTML(value) {
				this.html.innerHTML = value;
			};
			getInnerHTML() {
				return (this.html.innerHTML);
			};
			appendInnerHTML(value) {
				this.setInnerHTML(this.getInnerHTML() + value);
			};
		};
		var interface = {
			score: new InterfaceElement("score"),
			bonus: new InterfaceElement("bonus"),
			menu: new InterfaceElement("menu"),
			restartButton: new InterfaceElement("restartButton"),
			initUI: function (application) {
				this.menu.makeInvisible(true);
				this.restartButton.html.click(function (event) {
					if (application.scene && application.engine)
					{
						application.engine.stopRenderLoop();
						application.scene.dispose();
						application.scene = null;
						application.createPlayground(application.playground.size);
						application.initRendering();
					}
					interface.menu.makeInvisible(true);
				});
				this.initScores();
			},
			initScores: function () {
				this.score.numbers[0].innerHTML = 0;
				this.bonus.numbers[0].innerHTML = 0;
			},
			updateScore: function (value) {
				var	nbr = Number(this.score.numbers[0].innerHTML);
				this.score.numbers[0].innerHTML = nbr + value;
			},
			updateBonus: function (value) {
				this.bonus.numbers[0].innerHTML = value;
			},
			displayMenu: function () {
				this.menu.makeVisible();
			},
			hideMenu: function () {
				this.menu.makeInvisible();
			}
		}
		return (interface);
	}
);
