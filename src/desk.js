import 'phaser';

import Action from 'action';

export default class Desk {

  constructor(game, x, y, player) {
    this.game = game;

    this.group = game.add.group();

    this.desk = this.game.add.graphics(x, y);
    this.desk.beginFill(0xFF0000, 1);
    this.desk.drawRect(0, 0, 100, 50);

    this.group.add(this.desk);
    
    this._isInfected = false;

    this.action = new Action(game, x, y, this.group, "[E] Infect", function() {});
    this.action.hide();
  }
  
  sprite() {
    return this.desk;
  }
  
  infect() {
    this._isInfected = true;
    
    this.desk.destroy();
    this.desk = this.game.add.graphics(this.desk.x, this.desk.y);
    this.desk.beginFill(0x00FF00, 1);
    this.desk.drawRect(0, 0, 100, 50);
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
}

