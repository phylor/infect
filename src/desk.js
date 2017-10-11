import 'phaser';

import Action from 'action';

export default class Desk {

  constructor(game, x, y, seatY) {
    this.game = game;
    this._isInfected = false;

    this.group = this.game.add.group();

    this.createOrReplaceDeskSprite(0xFF0000, x, y);

    this.action = new Action(game, x, y, this.group, "[E] Infect", function() {});
    this.action.hide();

    this.employee = null;

    this.seatY = seatY;
  }
  
  sprite() {
    return this.desk;
  }
  
  infect() {
    this._isInfected = true;
    
    this.createOrReplaceDeskSprite(0x00FF00, this.desk.x, this.desk.y);
  }
  
  isInfected() {
    return this._isInfected;
  }

  showAction() {
    this.action.show();
  }

  hideAction() {
    this.action.hide();
  }

  createOrReplaceDeskSprite(color, x, y) {
    if(this.desk)
      this.desk.destroy();

    this.desk = this.game.add.sprite(x, y, 'desk');

    this.game.physics.arcade.enable(this.desk);
    this.desk.body.immovable = true;

    this.group.add(this.desk);
  }

  setEmployee(employee) {
    this.employee = employee;
  }

  getEmployee() {
    return this.employee;
  }

  getSeatPosition() {
    return new Phaser.Point(this.sprite().getBounds().x+this.sprite().getBounds().width/2, this.seatY);
  }
}
