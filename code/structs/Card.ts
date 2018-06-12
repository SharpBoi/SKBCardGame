import IVisual from "../intfs/IVisual";

export enum FlipState {"NowFace", "NowBack"}

export class Card implements IVisual
{
    private gridCont : HTMLDivElement;
    private cont : HTMLDivElement;
    private showImg : HTMLImageElement;
    private faceImg : HTMLImageElement;
    private shirtImg : HTMLImageElement;
    private name = "";
    public get Name(){return this.name;};

    private isIncreased = false;
    public get IsIncreased(){return this.isIncreased;}
    private isAnimating = false;
    private isMouseOver = false;
    public IsInteractive = false;

    private flipState = FlipState.NowFace;
    public get FlipState(){return this.flipState;}

    public OnClick ;
    
    constructor(cardName : string) {
        this.name = cardName;

        this.gridCont = document.createElement("div");
        this.cont = document.createElement("div");
        this.faceImg = document.createElement("img");
        this.shirtImg = document.createElement("img");
        this.showImg = document.createElement("img");

        this.faceImg.src = "./content/textures/cards/" + cardName + ".png";

        this.shirtImg.src = "./content/textures/cards/shirt.png";

        this.showImg.src = this.faceImg.src;
        this.showImg.ondragstart = ()=>{ return false; };

        this.cont.appendChild(this.showImg);
        this.cont.setAttribute("data-tid", "Card");

        this.gridCont.className = "card";
        this.gridCont.appendChild(this.cont);
        
        //#region Inc/dec on mouse move
        this.cont.addEventListener("mouseenter", () =>
        {
            this.isMouseOver = true;
        });
        this.cont.addEventListener("mouseleave", () =>
        {
            this.isMouseOver = false;
        });
        //#endregion

        //#region Flip on click
        this.cont.addEventListener("click", ()=>
        {
            if(this.isAnimating == false)
                if(this.IsInteractive)
                {
                    this.OnClick(this);
                    // this.Flip(true);
                }
        });
        //#endregion
    }

    public Update()
    {
        if(this.IsInteractive)
            if(this.isMouseOver == true)
            {
                if(this.isIncreased == false && this.isAnimating == false)
                    this.Increase();
            }
            else if(this.isIncreased && this.isAnimating == false)
                this.Decrease();
    }

    //#region Animations
    public Flip(animate : boolean, onEnd?)
    {
        if(animate)
        {
            // if(this.isAnimating == false)
            {
                this.isAnimating = true;
                // сживаем карту
                this.Squeeze(()=>
                {
                    this.ChangeShowImage();
                    // разжимаем карту
                    this.Unsqueeze(()=>
                    {
                        this.isAnimating = false;
                        this.showImg.style.width = "inherit";
                        if(this.flipState == FlipState.NowBack)
                            this.cont.setAttribute("data-tid", "Card-flipped");
                        else if(this.flipState == FlipState.NowFace)
                            this.cont.setAttribute("data-tid", "Card");
                        if(onEnd)onEnd();
                    });
                });
            }
        }
        else
        {
            this.ChangeShowImage();
            if(this.flipState == FlipState.NowBack)
                this.cont.setAttribute("data-tid", "Card-flipped");
            else if(this.flipState == FlipState.NowFace)
                this.cont.setAttribute("data-tid", "Card");
        }
    }

    public FlipToFace(animate : boolean, onEnd?)
    {
        if(this.flipState == FlipState.NowBack)
            this.Flip(animate, onEnd);
    }
    public FlipToBack(animate : boolean, onEnd?)
    {
        if(this.flipState == FlipState.NowFace)
            this.Flip(animate, onEnd);
    }
    public Collapse()
    {
        $(this.cont).animate(
            {width:"-=200", height:"-=280", left:"+=100", top:"+=140"},
            1000, "", ()=>this.Hide());
    }

    private ChangeShowImage()
    {
        if(this.flipState == FlipState.NowFace)
        {
            this.showImg.src = this.shirtImg.src;
            this.flipState = FlipState.NowBack;
            return;
        }
        if(this.flipState == FlipState.NowBack)
        {
            this.showImg.src = this.faceImg.src;
            this.flipState = FlipState.NowFace;
            return;
        }
    }

    private Squeeze(onEnd)
    {
        // сжимаем карту
        $(this.showImg).animate(
            { width: "-=100", left: "+=50" },
            100, "", ()=>onEnd());
    }
    private Unsqueeze(onEnd)
    {
        // разжимаем карту
        $(this.showImg).animate(
            { width: "+=100", left: "-=50" },
            100, "", ()=>onEnd());
    }

    public Increase()
    {
        this.isAnimating = true;
        this.isIncreased = true;
        $(this.cont).animate(
            { left: "-=10", width: "+=20", top: "-=10", height: "+=20" },
            100, "", ()=>
            {
                this.isAnimating = false;
            });
    }
    public Decrease()
    {
        this.isAnimating = true;
        this.isIncreased = false;
        $(this.cont).animate(
            { left: "+=10", width: "-=20", top: "+=10", height: "-=20" },
            100, "", ()=>
            {
                this.isAnimating = false;
            });
    }
    //#endregion

    GetNode(): HTMLElement {
        return this.gridCont;
    }
    Show() {
        this.cont.style.visibility = "visible";
    }
    Hide() {
        this.cont.style.visibility = "hidden";
    }
    
}