import 'phaser';

import Action from 'action';

export default class Desk {

  constructor(game, x, y, player) {
    this.game = game;
    this._isInfected = false;

    this.group = this.game.add.group();

    this.createOrReplaceDeskSprite(0xFF0000, x, y);

    this.action = new Action(game, x, y, this.group, "[E] Infect", function() {});
    this.action.hide();
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

    this.desk = this.game.add.graphics(x, y);
    this.desk.beginFill(color, 1);
    this.desk.drawRect(0, 0, 100, 50);

    this.game.physics.arcade.enable(this.desk);
    this.desk.body.immovable = true;

    this.group.add(this.desk);
  }
}
