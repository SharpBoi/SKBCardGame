import { BasicLayout } from "./BasicLayout";
import { Card, FlipState } from "../structs/Card";

export class GameLayout extends BasicLayout
{
    private spnScore : HTMLSpanElement;
    private deck : HTMLDivElement;
    private rows : HTMLDivElement[] = [];
    
    private cards : Card[] = [];
    private openedCards : Card[] = [];
    private cardsNames = [
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

    private updateInterval = -1;
    private startTimeout = -1;

    private openedPairs = 0;
    private closedPairs = 9;
    private score = 0;

    public OnGameEnd;

    constructor(domCLASS : string)
    {
        super(domCLASS);

        // get restart btn
        this.AppendControl("#gameLayout-restart", () => this.Start());
        // get score span
        this.spnScore = $(domCLASS + " #gameLayout-score-value").get(0);
        // get deck
        this.deck = $(domCLASS + " .gameLayout-deck").get(0) as HTMLDivElement;
    }

    public GenCardGrid()
    {
        this.rows.length = 0;
        this.cards.length = 0;

        //get deck rows
        for(var i = 0; i < 3; i++) 
        {
            this.rows.push($(this.deck).find(".deckRow").get(i) as HTMLDivElement);
            this.rows[i].innerHTML = "";
        }

        // gen random cards indeces
        var randNames = [];
        var usedRnds = [];
        for(var i = 0; i < 9; i++)
        {
            var rnd = 0
            while(true)
            {
                rnd = this.rand(0, this.cardsNames.length);
                if(usedRnds.indexOf(rnd) == -1)
                {
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
        for(var ri = 0; ri < rowsCount; ri++)
        {
            for(var ci = 0; ci < colsCount; ci++)
            {
                var card = new Card(randNames[ri * colsCount + ci]);
                this.rows[ri].appendChild(card.GetNode());
                this.cards.push(card);

                card.Show();
                card.GetNode().style.margin = "10px";

                if(ri == 0) card.GetNode().style.marginTop = "0px";
                if(ri == rowsCount) card.GetNode().style.marginBottom = "0px";

                if(ci == 0) card.GetNode().style.marginLeft = "0px";
                if(ci == 5) card.GetNode().style.marginRight = "0px";
            }
        }
    }

    public Start()
    {
        this.score = 0;
        this.openedPairs = 0;
        this.closedPairs = 9;
        clearInterval(this.updateInterval);
        clearTimeout(this.startTimeout);
        this.openedCards.length = 0;
        this.cards.length = 0;
        this.spnScore.innerHTML = "0";
        this.GenCardGrid();
        this.startTimeout = setTimeout(()=>
        {
            for(var i = 0; i < this.cards.length; i++)
            {
                this.cards[i].IsInteractive = false;
                this.cards[i].FlipToBack(true);
                this.cards[i].IsInteractive = true;

                this.cards[i].OnClick = (card:Card)=>
                {
                    if(this.openedCards.indexOf(card) != -1) // если карта есть в открытых картах, то удаляем ее
                        this.openedCards.splice(this.openedCards.indexOf(card), 1);
                    else if(this.openedCards.length < 2)// иначе, добавляем
                        this.openedCards.push(card);

                    card.Flip(true);
                    this.updateGameLogic();
                };
            }

            // start update
            this.updateInterval = setInterval(() => this.update(), 1);
        }, 5000);
    }

    private update()
    {
        for(var i = 0; i < this.cards.length; i++)
        {
            this.cards[i].Update();
        }
    }
    private updateGameLogic()
    {
        if(this.openedCards.length == 2)
        {
            // Нашли пару карт
            if(this.openedCards[0].Name == this.openedCards[1].Name)
            {
                this.openedPairs++;
                this.closedPairs--;
                this.score += this.closedPairs * 42;
                if(this.score < 0)this.score = 0;
                this.setScore(this.score);

                this.cards.forEach(element => {
                    element.IsInteractive = false;
                });

                setTimeout(()=>
                {
                    this.openedCards.forEach(element => {
                        element.Collapse();
                    });
                    this.cards.forEach(element => {
                        element.IsInteractive = true;
                    });
                    this.openedCards.length = 0;
                }, 300);
            }
            else // не нашли пару карт
            {
                this.score -= this.openedPairs * 42;
                if(this.score < 0)this.score = 0;
                this.setScore(this.score);

                // делаем все карты не юзабельными
                this.cards.forEach(element => {
                    element.IsInteractive = false;
                });

                setTimeout(()=>
                {                    
                    this.openedCards.forEach(element => {
                        // делаем открытые карты не юзабельными
                        element.IsInteractive=false;
                        // флипаем открытые обратно
                        element.FlipToBack(true, ()=>
                        {
                            if(element.IsIncreased) element.Decrease();
                            // делаем открытые снова юзабельными, после окончания флипа
                            element.IsInteractive = true;

                            // делаем все карты юзабельными после окончания флипа
                            this.cards.forEach(element => {
                                element.IsInteractive = true;
                            });
                        });
                    });
                    this.openedCards.length = 0;
                }, 500);
            }
        }

        if(this.closedPairs == 0)
            setTimeout(()=>this.OnGameEnd(), 500);
    }

    private setScore(value:number)
    {
        this.spnScore.innerHTML = value + "";
    }
    public GetScore() : number
    {
        return parseInt(this.spnScore.innerHTML);
    }

    private rand(from, to) : number
    {
        return Math.round(Math.random() * (to - 1 - from) + from);
    }
    private shuffle(a : any[]) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}