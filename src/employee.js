import Pathfinder from 'pathfinder';
import { distance } from 'utils';
import { sample } from 'lodash';

export default class Employee {
    
  constructor(game, x, y, group, collisionObjects) {
    this.game = game;
    this.collisionObjects = collisionObjects;

    this.employeeSprite = this.game.add.graphics(x, y);
    this.employeeSprite.beginFill(0x0000FF, 1);
    this.employeeSprite.drawCircle(0, 0, 30);
    this.employeeSprite.alpha = 0.5;
    this.employeeSprite.anchor.set(0.5, 0.5);
    
    this.isInfected = false;

    this.game.physics.arcade.enable(this.employeeSprite);
    this.employeeSprite.body.collideWorldBounds = true;

    this.noPathFound = false;

    this.possibleDestinations = [
      new Phaser.Point(this.game.width/2, 50),
      new Phaser.Point(this.game.width/2, this.game.height-150),
      new Phaser.Point(130, 200),
      new Phaser.Point(115, 420),
      new Phaser.Point(620, 290),
      new Phaser.Point(400, 550),
      new Phaser.Point(720, 30)
    ];
    this.destination = null;
    this.freelyMoves = true;
  }
  
  sprite() {
      return this.employeeSprite;
  }

  destinationReached() {
    if(!this.hasDestination())
      return false;

    return distance(this.employeeSprite.x, this.employeeSprite.y, this.destination.x, this.destination.y) < 20;
  }
  
  roam() {
    if(!this.scheduledMove && this.freelyMoves) {
      this.scheduledMove = this.game.time.events.add(this.game.rnd.integerInRange(2, 10) * Phaser.Timer.SECOND, () => {
        let newDestination = sample(this.possibleDestinations);

        this.goTo(newDestination.x, newDestination.y);
        this.scheduledMove = null;
      }, this);
    }
  }

  stop() {
    if(this.employeeSprite && this.employeeSprite.body) this.employeeSprite.body.velocity.set(0);
  }

  move() {
    if(!this.hasDestination() || this.isInfected) {
      this.stop();
      return;
    }

    if(this.destinationReached()) {
      this.stop();
      this.pathfinder.complete();
      // TODO: we need to differentiate between the destination (could be a location on a collision object)
      // and the path finding destination
      this.teleportTo(this.destination.x, this.destination.y);
      this.destination = null;
    }
    else {
      const SPEED = 250;

      if(this.pathfinder.hasFoundPath()) {
        var nextWaypoint = this.pathfinder.getNextWaypoint() || this.destination;

        if(distance(this.employeeSprite.x, this.employeeSprite.y, nextWaypoint.x, nextWaypoint.y) < 10) {
          this.pathfinder.popWaypoint();
          nextWaypoint = this.pathfinder.getNextWaypoint() || this.destination;
        }

        let velocity = this.pathfinder.getVelocity(this.employeeSprite.x, this.employeeSprite.y, nextWaypoint.x, nextWaypoint.y, SPEED);
        this.employeeSprite.body.velocity.set(velocity[0], velocity[1]);
      }
      else {
        this.employeeSprite.body.velocity.set(0);
        this.noPathFound = true;
      }
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

  goTo(x, y) {
    this.destination = new Phaser.Point(x, y);
    this.noPathFound = false;
    this.employeeSprite.body.velocity.set(0, 0);
    this.pathfinder = new Pathfinder(this.game, this.collisionObjects, this.employeeSprite.position, this.destination);
    this.pathfinder.findPath();
  }

  setDesk(desk) {
    this.desk = desk;
  }

  hasDesk() {
    return !!this.desk;
  }

  goToDesk() {
    if(!this.hasDesk())
      return;

    let bounds = new Phaser.Rectangle().copyFrom(this.desk.sprite().getBounds());
    bounds.inflate(20, 20);

    console.log(this.desk.sprite().getBounds().y + ' [' + this.desk.getSeatPosition().y + ']');
    this.goTo(bounds.x + bounds.width/2, this.desk.sprite().getBounds().y == this.desk.getSeatPosition().y ? bounds.y : bounds.y+bounds.height);
  }

  hasDestination() {
    return !!this.destination;
  }

  getDestination() {
    return this.destination;
  }

  teleportTo(x, y) {
    let seatPosition = this.desk.getSeatPosition();
    this.employeeSprite.position.set(seatPosition.x, seatPosition.y);
  }
}
