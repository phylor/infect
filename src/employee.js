import { rand } from 'utils';
import Pathfinder from 'pathfinder';
import { distance } from 'utils';

export default class Employee {
    
    constructor(game, x, y, group, collisionObjects) {
        this.game = game;

        this.employeeSprite = this.game.add.graphics(x, y);
        this.employeeSprite.beginFill(0x0000FF, 1);
        this.employeeSprite.drawCircle(0, 0, 30);
        this.employeeSprite.alpha = 0.5;
        this.employeeSprite.anchor.set(0.5, 0.5);
        
        this.isInfected = false;

        this.game.physics.arcade.enable(this.employeeSprite);
        this.employeeSprite.body.collideWorldBounds = true;

        this.pathfinder = new Pathfinder(this.game, collisionObjects);
        this.noPathFound = false;
    }
    
    sprite() {
        return this.employeeSprite;
    }

    destinationReached() {
      return distance(this.employeeSprite.x, this.employeeSprite.y, this.game.width/2, 50) < 20;
    }
    
    move() {
        if(this.isInfected || this.noPathFound || this.destinationReached()) {
          // We don't have to do anything here, as the sprite is destroyed and recreated upon infection.
          // Hence, the velocity of the new sprite is 0.
          this.employeeSprite.body.velocity.set(0);
        }
        else {
          const SPEED = 250;

          if((this.nextWaypoint && distance(this.employeeSprite.x, this.employeeSprite.y, this.nextWaypoint[0], this.nextWaypoint[1]) < 10) || (this.employeeSprite.body.velocity.x == 0 && this.employeeSprite.body.velocity.y == 0)) {

            this.nextWaypoint = this.pathfinder.findPath(this.employeeSprite.x, this.employeeSprite.y, this.game.width/2, 50);

            if(this.nextWaypoint) {
              let velocity = this.pathfinder.getVelocity(this.employeeSprite.x, this.employeeSprite.y, this.nextWaypoint[0], this.nextWaypoint[1], SPEED);
              this.employeeSprite.body.velocity.set(velocity[0], velocity[1]);
            }
          }
          //else {
          //  //let x = rand(0, 500) - SPEED;
          //  //let y = rand(0, 500) - SPEED;

          //  this.employeeSprite.body.velocity.set(0);
          //  this.noPathFound = true;
          //}
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
