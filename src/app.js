import 'phaser';

import Action from 'action';
import Desk from 'desk';
import Employee from 'employee';
import Pathfinder from 'pathfinder';

import officeFloor from '../assets/gfx/office_floor.svg';
import logo from '../assets/gfx/logo.png';

let width = 800;
let height = 600;
let tilesize = 50;

var mainMenuState = function(game) {
};

mainMenuState.prototype = {
  preload: function() {
    this.game.load.image('logo', logo);
  },

  create: function() {
    this.game.stage.backgroundColor = 0xF5F5F5;

    let logo = this.game.add.sprite(width/2, 100, 'logo');
    logo.anchor.set(0.5);

    let newGame = this.game.add.text(width/2, height/2, "# New Game", { fill: '#103A4A', font: '32px Helvetica Neue' });
    newGame.anchor.set(0.5);
    newGame.inputEnabled = true;
    newGame.events.onInputDown.add(() => this.game.state.start('Game'), this);
  }
};

var gameState = function(game) {
};

gameState.prototype = {
  preload: preload,
  create: create,
  update: update
};

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });
game.state.add("MainMenu", mainMenuState);
game.state.add("Game", gameState);
game.state.start("MainMenu");

var cursors, useKey;
var player, playerSprite;
var desks = [];
var actionText, actionTarget;

var employeesGroup;
var employees = [];

var walls = [];

var deskInfectionsLeft = 5;
var deskInfectionsCounter;
var healthyLeftCounter;
var timeCounter;

var timeOfDay = 0;


function preload() {
    game.load.image('floor', officeFloor);
}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    var floor = game.add.group();
    for(let x = 0; x < width; x += tilesize) {
        for(let y = 0; y < height; y += tilesize) {
            var floorTile = game.add.sprite(x, y, 'floor');
            floorTile.width = tilesize;
            floorTile.height = tilesize;
            
            floor.add(floorTile);
        }
    }
    
    cursors = game.input.keyboard.createCursorKeys();
    useKey = game.input.keyboard.addKey(Phaser.Keyboard.E);
    
    player = game.add.group();

    // bottom right
    desks.push(new Desk(game, width-220, height-50-115, player));
    desks.push(new Desk(game, width-220, height-50-60, player));

    desks.push(new Desk(game, width-325, height-50-115, player));
    desks.push(new Desk(game, width-325, height-50-60, player));

    // bottom left
    desks.push(new Desk(game, 70, height-50-75, player));
    desks.push(new Desk(game, 175, height-50-75, player));

    // top left
    desks.push(new Desk(game, 70, height-50-285, player));
    desks.push(new Desk(game, 70, height-50-230, player));

    desks.push(new Desk(game, 175, height-50-285, player));
    desks.push(new Desk(game, 175, height-50-230, player));

    // meeting room big
    desks.push(new Desk(game, width-230, 80, player));
    desks.push(new Desk(game, width-230, 150, player));

    createWalls();

    let collisionObjects = desks.map(desk => desk.sprite()).concat(walls);

    employeesGroup = game.add.group();
    for(var i = 0; i < 10; ++i) {
        var x = game.rnd.integerInRange(0, width);
        var y = game.rnd.integerInRange(0, height);

        while(collisionObjects.some(spriteBounds => {
          let bounds = new Phaser.Rectangle().copyFrom(spriteBounds);
          bounds.inflate(30, 30);
          return bounds.contains(x, y);
        })) {
          x = game.rnd.integerInRange(0, width);
          y = game.rnd.integerInRange(0, height);
        }

        employees.push(new Employee(game, x, y, employeesGroup, collisionObjects));
    }
    
    
    playerSprite = game.add.graphics(width/2, height/2);
    playerSprite.beginFill(0xFF0000, 0.5);
    playerSprite.drawCircle(0, 0, 40);
    playerSprite.anchor.set(0.5, 0.5);
    game.physics.arcade.enable(playerSprite);
    playerSprite.body.collideWorldBounds = true;
    
    player.add(playerSprite);

    timeOfDay = 0;
    game.time.events.loop(3 * Phaser.Timer.SECOND, () => timeOfDay = (timeOfDay + 1) % 24, this);

    createUi();

    game.input.onUp.add(() => console.log(game.input.activePointer.position), this);
}

function update() {
    movePlayer();

    collisionDetection();
    playerUseAction();
    
    moveEmployees();

    updateInfectedCount();

    timeCounter.setText(toHumanTime(timeOfDay));
}

function movePlayer() {
    const SPEED = 250;

    if(cursors.right.isDown) {
        playerSprite.body.velocity.x = SPEED;
    }
    if(cursors.left.isDown) {
        playerSprite.body.velocity.x = -SPEED;
    }

    if(!cursors.left.isDown && !cursors.right.isDown)
      playerSprite.body.velocity.x = 0;

    if(cursors.up.isDown) {
        playerSprite.body.velocity.y = -SPEED;
    }
    if(cursors.down.isDown) {
        playerSprite.body.velocity.y = SPEED;
    }

    if(!cursors.up.isDown && !cursors.down.isDown)
      playerSprite.body.velocity.y = 0;
}

function collisionDetection() {
    desks
      .filter(desk => desk != actionTarget)
      .forEach(desk => desk.hideAction());

    desks.forEach(desk => {
      game.physics.arcade.collide(desk.sprite(), playerSprite, () => {
        desk.showAction();
        actionTarget = desk;
      });

      employees.forEach(employee => game.physics.arcade.collide(employee.sprite(), desk.sprite(), () => {
        if(desk.isInfected())
          employee.infect();
      }));
    });
    walls.forEach(wall => {
      game.physics.arcade.collide(wall, playerSprite);

      employees.forEach(employee => game.physics.arcade.collide(employee.sprite(), wall));
    });
}

function playerUseAction() {
    if(useKey.isDown) {
        if(actionTarget && !actionTarget.isInfected() && deskInfectionsLeft > 0) {
            actionTarget.infect();
            actionTarget.hideAction();
            actionTarget = null;
            --deskInfectionsLeft;
            deskInfectionsCounter.setText(deskInfectionsLeft);
        }
    }
}

function createWalls() {
  let entranceRightX = width/2+50;
  let meetingRoomX = width/2+220;
  let toilet1X = 100;
  let toilet2X = 200;
  let wallY = 150;
  let doorWidth = 65;

  let lines = [
    [entranceRightX, 0, 0, wallY],
    [width/2-75, 0, 0, wallY],
    [toilet1X, 0, 0, wallY],
    [toilet2X, 0, 0, wallY]
  ];

  lines.forEach(line => {
    let wall = game.add.graphics(line[0], line[1]);
    wall.lineStyle(3, 0x000000, 1);
    wall.lineTo(line[2], line[3]);

    game.physics.arcade.enable(wall);
    wall.body.immovable = true;

    walls.push(wall);
  });
}

function createUi() {
  let uiGroup = game.add.group();

  let background = game.add.graphics(0, 0);
  background.beginFill(0x0000FF, 1);
  background.drawRect(0, 0, 200, 25);
  uiGroup.add(background);

  deskInfectionsCounter = game.add.text(5, 2, deskInfectionsLeft, { fill: '#fff', font: '16px' });
  uiGroup.add(deskInfectionsCounter);

  healthyLeftCounter = game.add.text(20, 2, employees.length, { fill: '#fff', font: '16px' });
  uiGroup.add(healthyLeftCounter);

  timeCounter = game.add.text(55, 2, toHumanTime(timeOfDay), { fill: '#fff', font: '16px' });
  uiGroup.add(timeCounter);
}

function toHumanTime(time) {
  return time.toString().padStart(2, '0') + ':00';
}

function moveEmployees() {
    employees.forEach(employee => employee.move());
}

function updateInfectedCount() {
  let healthyLeft = employees.filter(employee => !employee.isInfected).length;
  healthyLeftCounter.setText(healthyLeft);
}
