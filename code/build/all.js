var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Main = /** @class */ (function () {
    function Main() {
        var _this = this;
        this.startGameLayout = new BasicLayout(".startGameLayout");
        this.startGameLayout.Show();
        this.gameLayout = new GameLayout(".gameLayout");
        this.gameLayout.Hide();
        this.endGameLayout = new BasicLayout(".endGameLayout");
        this.endGameLayout.Hide();
        this.startGameLayout.AppendControl("#startGameLayout-start", function () {
            _this.startGameLayout.Hide();
            _this.gameLayout.Show();
            _this.gameLayout.Start();
        });
        this.gameLayout.OnGameEnd = function () {
            _this.gameLayout.Hide();
            _this.endGameLayout.GetControl("#title").innerHTML =
                "Поздравляем!<br>Ваш итоговый счет: " + _this.gameLayout.GetScore();
            _this.endGameLayout.Show();
        };
        this.endGameLayout.AppendControl("#endGameLayout-restart", function () {
            _this.endGameLayout.Hide();
            _this.gameLayout.Show();
            _this.gameLayout.Start();
        });
    }
    return Main;
}());
window.onload = function () {
    var main = new Main();
};
var BasicLayout = /** @class */ (function () {
    function BasicLayout(domIDorCLASS) {
        this.controls = [];
        this.cont = $(domIDorCLASS).get()[0];
        this.parent = this.cont.parentElement;
    }
    //#endregion
    //#region Funcs
    BasicLayout.prototype.AppendControl = function (controlID, todo) {
        var control = $(this.cont).find(controlID).get(0);
        for (var i = 0; i < this.controls.length; i++)
            if (this.controls[i] == control) {
                this.controls[i].addEventListener("click", function () { return todo(); });
            }
            else {
                control.addEventListener("click", function () { return todo(); });
                this.controls.push(control);
            }
        if (this.controls.length == 0) {
            control.addEventListener("click", function () { return todo(); });
            this.controls.push(control);
        }
    };
    BasicLayout.prototype.GetControl = function (controlID) {
        return $(this.cont).find(controlID).get(0);
    };
    BasicLayout.prototype.GetNode = function () {
        return this.cont;
    };
    BasicLayout.prototype.Show = function () {
        if (parent != undefined)
            this.parent.appendChild(this.cont);
        this.cont.style.visibility = "visible";
    };
    BasicLayout.prototype.Hide = function () {
        if (this.cont.parentElement != undefined) {
            this.parent = this.cont.parentElement;
            this.cont.parentElement.removeChild(this.cont);
        }
        this.cont.style.visibility = "hidden";
    };
    return BasicLayout;
}());
var GameLayout = /** @class */ (function (_super) {
    __extends(GameLayout, _super);
    function GameLayout(domCLASS) {
        var _this = _super.call(this, domCLASS) || this;
        _this.rows = [];
        _this.cards = [];
        _this.openedCards = [];
        _this.cardsNames = [
            "0C", "0D", "0H", "0S",
            "2C", "2D", "2H", "2S",
            "3C", "3D", "3H", "3S",
            "4C", "4D", "4H", "4S",
            "5C", "5D", "5H", "5S",
            "6C", "6D", "6H", "6S",
            "7C", "7D", "7H", "7S",
            "8C", "8D", "8H", "8S",
            "9C", "9D", "9H", "9S",
            "AC", "AD", "AH", "AS",
            "JC", "JD", "JH", "JS",
            "KC", "KD", "KH", "KS",
            "QC", "QD", "QH", "QS",
        ];
        _this.updateInterval = -1;
        _this.startTimeout = -1;
        _this.openedPairs = 0;
        _this.closedPairs = 9;
        _this.score = 0;
        // get restart btn
        _this.AppendControl("#gameLayout-restart", function () { return _this.Start(); });
        // get score span
        _this.spnScore = $(domCLASS + " #gameLayout-score-value").get(0);
        // get deck
        _this.deck = $(domCLASS + " .gameLayout-deck").get(0);
        return _this;
    }
    GameLayout.prototype.GenCardGrid = function () {
        this.rows.length = 0;
        this.cards.length = 0;
        //get deck rows
        for (var i = 0; i < 3; i++) {
            this.rows.push($(this.deck).find(".deckRow").get(i));
            this.rows[i].innerHTML = "";
        }
        // gen random cards indeces
        var randNames = [];
        var usedRnds = [];
        for (var i = 0; i < 9; i++) {
            var rnd = 0;
            while (true) {
                rnd = this.rand(0, this.cardsNames.length);
                if (usedRnds.indexOf(rnd) == -1) {
                    usedRnds.push(rnd);
                    break;
                }
            }
            randNames.push(this.cardsNames[rnd]);
            randNames.push(this.cardsNames[rnd]);
        }
        this.shuffle(randNames);
        // add and configure cards on deck
        var rowsCount = this.rows.length;
        var colsCount = 6;
        for (var ri = 0; ri < rowsCount; ri++) {
            for (var ci = 0; ci < colsCount; ci++) {
                var card = new Card(randNames[ri * colsCount + ci]);
                this.rows[ri].appendChild(card.GetNode());
                this.cards.push(card);
                card.Show();
                card.GetNode().style.margin = "10px";
                if (ri == 0)
                    card.GetNode().style.marginTop = "0px";
                if (ri == rowsCount)
                    card.GetNode().style.marginBottom = "0px";
                if (ci == 0)
                    card.GetNode().style.marginLeft = "0px";
                if (ci == 5)
                    card.GetNode().style.marginRight = "0px";
            }
        }
    };
    GameLayout.prototype.Start = function () {
        var _this = this;
        this.score = 0;
        this.openedPairs = 0;
        this.closedPairs = 9;
        clearInterval(this.updateInterval);
        clearTimeout(this.startTimeout);
        this.openedCards.length = 0;
        this.cards.length = 0;
        this.spnScore.innerHTML = "0";
        this.GenCardGrid();
        this.startTimeout = setTimeout(function () {
            for (var i = 0; i < _this.cards.length; i++) {
                _this.cards[i].IsInteractive = false;
                _this.cards[i].FlipToBack(true);
                _this.cards[i].IsInteractive = true;
                _this.cards[i].OnClick = function (card) {
                    if (_this.openedCards.indexOf(card) != -1)
                        _this.openedCards.splice(_this.openedCards.indexOf(card), 1);
                    else if (_this.openedCards.length < 2)
                        _this.openedCards.push(card);
                    card.Flip(true);
                    _this.updateGameLogic();
                };
            }
            // start update
            _this.updateInterval = setInterval(function () { return _this.update(); }, 1);
        }, 5000);
    };
    GameLayout.prototype.update = function () {
        for (var i = 0; i < this.cards.length; i++) {
            this.cards[i].Update();
        }
    };
    GameLayout.prototype.updateGameLogic = function () {
        var _this = this;
        if (this.openedCards.length == 2) {
            // Нашли пару карт
            if (this.openedCards[0].Name == this.openedCards[1].Name) {
                this.openedPairs++;
                this.closedPairs--;
                this.score += this.closedPairs * 42;
                if (this.score < 0)
                    this.score = 0;
                this.setScore(this.score);
                this.cards.forEach(function (element) {
                    element.IsInteractive = false;
                });
                setTimeout(function () {
                    _this.openedCards.forEach(function (element) {
                        element.Collapse();
                    });
                    _this.cards.forEach(function (element) {
                        element.IsInteractive = true;
                    });
                    _this.openedCards.length = 0;
                }, 300);
            }
            else {
                this.score -= this.openedPairs * 42;
                if (this.score < 0)
                    this.score = 0;
                this.setScore(this.score);
                // делаем все карты не юзабельными
                this.cards.forEach(function (element) {
                    element.IsInteractive = false;
                });
                setTimeout(function () {
                    _this.openedCards.forEach(function (element) {
                        // делаем открытые карты не юзабельными
                        element.IsInteractive = false;
                        // флипаем открытые обратно
                        element.FlipToBack(true, function () {
                            if (element.IsIncreased)
                                element.Decrease();
                            // делаем открытые снова юзабельными, после окончания флипа
                            element.IsInteractive = true;
                            // делаем все карты юзабельными после окончания флипа
                            _this.cards.forEach(function (element) {
                                element.IsInteractive = true;
                            });
                        });
                    });
                    _this.openedCards.length = 0;
                }, 500);
            }
        }
        if (this.closedPairs == 0)
            setTimeout(function () { return _this.OnGameEnd(); }, 500);
    };
    GameLayout.prototype.setScore = function (value) {
        this.spnScore.innerHTML = value + "";
    };
    GameLayout.prototype.GetScore = function () {
        return parseInt(this.spnScore.innerHTML);
    };
    GameLayout.prototype.rand = function (from, to) {
        return Math.round(Math.random() * (to - 1 - from) + from);
    };
    GameLayout.prototype.shuffle = function (a) {
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            _a = [a[j], a[i]], a[i] = _a[0], a[j] = _a[1];
        }
        return a;
        var _a;
    };
    return GameLayout;
}(BasicLayout));
var FlipState;
(function (FlipState) {
    FlipState[FlipState["NowFace"] = 0] = "NowFace";
    FlipState[FlipState["NowBack"] = 1] = "NowBack";
})(FlipState || (FlipState = {}));
var Card = /** @class */ (function () {
    function Card(cardName) {
        var _this = this;
        this.name = "";
        this.isIncreased = false;
        this.isAnimating = false;
        this.isMouseOver = false;
        this.IsInteractive = false;
        this.flipState = FlipState.NowFace;
        this.name = cardName;
        this.gridCont = document.createElement("div");
        this.cont = document.createElement("div");
        this.faceImg = document.createElement("img");
        this.shirtImg = document.createElement("img");
        this.showImg = document.createElement("img");
        this.faceImg.src = "./content/textures/cards/" + cardName + ".png";
        this.shirtImg.src = "./content/textures/cards/shirt.png";
        this.showImg.src = this.faceImg.src;
        this.showImg.ondragstart = function () { return false; };
        this.cont.appendChild(this.showImg);
        this.cont.setAttribute("data-tid", "Card");
        this.gridCont.className = "card";
        this.gridCont.appendChild(this.cont);
        //#region Inc/dec on mouse move
        this.cont.addEventListener("mouseenter", function () {
            _this.isMouseOver = true;
        });
        this.cont.addEventListener("mouseleave", function () {
            _this.isMouseOver = false;
        });
        //#endregion
        //#region Flip on click
        this.cont.addEventListener("click", function () {
            if (_this.isAnimating == false)
                if (_this.IsInteractive) {
                    _this.OnClick(_this);
                    // this.Flip(true);
                }
        });
        //#endregion
    }
    Object.defineProperty(Card.prototype, "Name", {
        get: function () { return this.name; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(Card.prototype, "IsIncreased", {
        get: function () { return this.isIncreased; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "FlipState", {
        get: function () { return this.flipState; },
        enumerable: true,
        configurable: true
    });
    Card.prototype.Update = function () {
        if (this.IsInteractive)
            if (this.isMouseOver == true) {
                if (this.isIncreased == false && this.isAnimating == false)
                    this.Increase();
            }
            else if (this.isIncreased && this.isAnimating == false)
                this.Decrease();
    };
    //#region Animations
    Card.prototype.Flip = function (animate, onEnd) {
        var _this = this;
        if (animate) {
            // if(this.isAnimating == false)
            {
                this.isAnimating = true;
                // сживаем карту
                this.Squeeze(function () {
                    _this.ChangeShowImage();
                    // разжимаем карту
                    _this.Unsqueeze(function () {
                        _this.isAnimating = false;
                        _this.showImg.style.width = "inherit";
                        if (_this.flipState == FlipState.NowBack)
                            _this.cont.setAttribute("data-tid", "Card-flipped");
                        else if (_this.flipState == FlipState.NowFace)
                            _this.cont.setAttribute("data-tid", "Card");
                        if (onEnd)
                            onEnd();
                    });
                });
            }
        }
        else {
            this.ChangeShowImage();
            if (this.flipState == FlipState.NowBack)
                this.cont.setAttribute("data-tid", "Card-flipped");
            else if (this.flipState == FlipState.NowFace)
                this.cont.setAttribute("data-tid", "Card");
        }
    };
    Card.prototype.FlipToFace = function (animate, onEnd) {
        if (this.flipState == FlipState.NowBack)
            this.Flip(animate, onEnd);
    };
    Card.prototype.FlipToBack = function (animate, onEnd) {
        if (this.flipState == FlipState.NowFace)
            this.Flip(animate, onEnd);
    };
    Card.prototype.Collapse = function () {
        var _this = this;
        $(this.cont).animate({ width: "-=200", height: "-=280", left: "+=100", top: "+=140" }, 1000, "", function () { return _this.Hide(); });
    };
    Card.prototype.ChangeShowImage = function () {
        if (this.flipState == FlipState.NowFace) {
            this.showImg.src = this.shirtImg.src;
            this.flipState = FlipState.NowBack;
            return;
        }
        if (this.flipState == FlipState.NowBack) {
            this.showImg.src = this.faceImg.src;
            this.flipState = FlipState.NowFace;
            return;
        }
    };
    Card.prototype.Squeeze = function (onEnd) {
        // сжимаем карту
        $(this.showImg).animate({ width: "-=100", left: "+=50" }, 100, "", function () { return onEnd(); });
    };
    Card.prototype.Unsqueeze = function (onEnd) {
        // разжимаем карту
        $(this.showImg).animate({ width: "+=100", left: "-=50" }, 100, "", function () { return onEnd(); });
    };
    Card.prototype.Increase = function () {
        var _this = this;
        this.isAnimating = true;
        this.isIncreased = true;
        $(this.cont).animate({ left: "-=10", width: "+=20", top: "-=10", height: "+=20" }, 100, "", function () {
            _this.isAnimating = false;
        });
    };
    Card.prototype.Decrease = function () {
        var _this = this;
        this.isAnimating = true;
        this.isIncreased = false;
        $(this.cont).animate({ left: "+=10", width: "-=20", top: "+=10", height: "-=20" }, 100, "", function () {
            _this.isAnimating = false;
        });
    };
    //#endregion
    Card.prototype.GetNode = function () {
        return this.gridCont;
    };
    Card.prototype.Show = function () {
        this.cont.style.visibility = "visible";
    };
    Card.prototype.Hide = function () {
        this.cont.style.visibility = "hidden";
    };
    return Card;
}());
