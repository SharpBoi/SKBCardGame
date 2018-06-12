import IVisual from "../intfs/IVisual";
import { ILayout } from "../intfs/ILayout";

import "../jquery"

export class BasicLayout implements ILayout
{
    constructor(domIDorCLASS : string){

        this.cont = $(domIDorCLASS).get()[0] as HTMLDivElement;
        this.parent = this.cont.parentElement;
    }

    //#region Fields
    protected cont : HTMLDivElement;
    protected controls : HTMLElement[] = [];
    private parent : HTMLElement;
    //#endregion

    //#region Funcs
    public AppendControl(controlID : string, todo)
    {
        var control = $(this.cont).find(controlID).get(0);
        for(var i = 0; i < this.controls.length;i++)
            if(this.controls[i] == control)
            {
                this.controls[i].addEventListener("click", ()=>todo());
            }
            else
            {
                control.addEventListener("click", ()=>todo());
                this.controls.push(control);
            }
        if(this.controls.length == 0)
        {
            control.addEventListener("click", ()=>todo());
            this.controls.push(control);
        }
    }
    public GetControl(controlID : string) : HTMLElement
    {
        return $(this.cont).find(controlID).get(0);
    }

    public GetNode() : HTMLElement{
        return this.cont;
    }

    Show(){
        if(parent != undefined)
            this.parent.appendChild(this.cont);
        this.cont.style.visibility = "visible";
    }
    Hide(){
        if(this.cont.parentElement != undefined)
        {
            this.parent = this.cont.parentElement;
            this.cont.parentElement.removeChild(this.cont);
        }
        this.cont.style.visibility = "hidden";
    }
    //#endregion
}