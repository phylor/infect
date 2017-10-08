import { rand } from 'utils';

export default class Employee {
    
    constructor(game, x, y, group) {
        this.game = game;

        this.employeeSprite = this.game.add.graphics(x, y);
        this.employeeSprite.beginFill(0x0000FF, 1);
        this.employeeSprite.drawCircle(0, 0, 30);
        this.employeeSprite.alpha = 0.5;
        this.employeeSprite.anchor.set(0.5, 0.5);
        
        this.isInfected = false;

        this.game.physics.arcade.enable(this.employeeSprite);
        this.employeeSprite.body.collideWorldBounds = true;
    }
    
    sprite() {
        return this.employeeSprite;
    }
    
    move() {
        if(this.isInfected) {
          // We don't have to do anything here, as the sprite is destroyed and recreated upon infection.
          // Hence, the velocity of the new sprite is 0.
        }
        else {
          const SPEED = 250;

          let x = rand(0, 500) - SPEED;
          let y = rand(0, 500) - SPEED;

          this.employeeSprite.body.velocity.set(x, y);
        }
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
