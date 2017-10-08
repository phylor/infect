import { rand } from 'utils';

export default class Employee {
    
    constructor(game, x, y, group) {
        this.game = game;

        this.employeeSprite = this.game.add.graphics(x, y);
        this.employeeSprite.beginFill(0x0000FF, 1);
        this.employeeSprite.drawCircle(0, 0, 30);
        this.employeeSprite.alpha = 0.5;
        
        this.isInfected = false;
    }
    
    sprite() {
        return this.employeeSprite;
    }
    
    move() {
        if(this.isInfected)
            return;
        
        let x = rand(0, 10) - 4.5;
        let y = rand(0, 10) - 4.5;
        
        this.employeeSprite.x += x;
        this.employeeSprite.y += y;
        
        if(this.employeeSprite.x < 0) this.employeeSprite.x = 0;
        if(this.employeeSprite.x > this.game.width) this.employeeSprite.x = this.game.width;
        if(this.employeeSprite.y < 0) this.employeeSprite.y = 0;
        if(this.employeeSprite.y > this.game.height) this.employeeSprite.y = this.game.height;
    }
    
    infect() {
        if(!this.isInfected) {
            this.employeeSprite.destroy();
            
            this.employeeSprite = this.game.add.graphics(this.employeeSprite.x, this.employeeSprite.y);
            this.employeeSprite.beginFill(0x00FF00, 1);
            this.employeeSprite.drawCircle(0, 0, 30);
            this.employeeSprite.alpha = 0.5;
        }
        
        this.isInfected = true;
    }
}
