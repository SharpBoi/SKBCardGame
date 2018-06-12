import { BasicLayout } from "./layouts/BasicLayout";
import { GameLayout } from "./layouts/GameLayout";
import { Card } from "./structs/Card";

export class Main
{    
    startGameLayout : BasicLayout;
    gameLayout : GameLayout;
    endGameLayout : BasicLayout;

    constructor(){
        
        this.startGameLayout = new BasicLayout(".startGameLayout");
        this.startGameLayout.Show();

        this.gameLayout = new GameLayout(".gameLayout");
        this.gameLayout.Hide();

        this.endGameLayout = new BasicLayout(".endGameLayout");
        this.endGameLayout.Hide();

        this.startGameLayout.AppendControl("#startGameLayout-start", () =>
        {
            this.startGameLayout.Hide();

            this.gameLayout.Show();
            this.gameLayout.Start();
        });

        this.gameLayout.OnGameEnd = ()=>
        {
            this.gameLayout.Hide();

            this.endGameLayout.GetControl("#title").innerHTML = 
                "Поздравляем!<br>Ваш итоговый счет: " + this.gameLayout.GetScore();
            this.endGameLayout.Show();
        };

        this.endGameLayout.AppendControl("#endGameLayout-restart", ()=>
        {
            this.endGameLayout.Hide();
            this.gameLayout.Show();
            this.gameLayout.Start();
        });
    }
}