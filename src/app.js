import 'phaser';

import Action from 'action';
import Desk from 'desk';
import Employee from 'employee';
import { rand } from 'utils';

import officeFloor from '../assets/gfx/office_floor.svg';

let width = 800;
let height = 600;
let tilesize = 50;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });

var cursors, useKey;
var player, playerSprite;
var desks = [];
var actionText, actionTarget;

var employeesGroup;
var employees = [];

var walls = [];

var deskInfectionsLeft = 5;
var deskInfectionsCounter;


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

    // top right
    desks.push(new Desk(game, width-120, height-50-325, player));
    desks.push(new Desk(game, width-120, height-50-270, player));
    
    // top middle
    desks.push(new Desk(game, width-120, height-50-145, player));
    desks.push(new Desk(game, width-120, height-50-200, player));

    // bottom right
    desks.push(new Desk(game, width-120, height-50-75, player));
    desks.push(new Desk(game, width-120, height-50-20, player));

    desks.push(new Desk(game, width-225, height-50-75, player));
    desks.push(new Desk(game, width-225, height-50-20, player));

    desks.push(new Desk(game, width-330, height-50-75, player));
    desks.push(new Desk(game, width-330, height-50-20, player));

    // bottom left
    desks.push(new Desk(game, 20, height-50-75, player));
    desks.push(new Desk(game, 20, height-50-20, player));

    desks.push(new Desk(game, 125, height-50-75, player));
    desks.push(new Desk(game, 125, height-50-20, player));

    desks.push(new Desk(game, 230, height-50-75, player));
    desks.push(new Desk(game, 230, height-50-20, player));

    // top left
    desks.push(new Desk(game, 20, height-50-325, player));
    desks.push(new Desk(game, 20, height-50-270, player));

    desks.push(new Desk(game, 125, height-50-325, player));
    desks.push(new Desk(game, 125, height-50-270, player));

    let rotatedDesk = new Desk(game, 280, height-50-322, player);
    rotatedDesk.sprite().rotation = Math.PI / 2;
    desks.push(rotatedDesk);

    // meeting room big
    desks.push(new Desk(game, width-120, 20, player));
    desks.push(new Desk(game, width-120, 70, player));

    // meeting room small
    desks.push(new Desk(game, width-300, 20, player));

    createWalls();

    employeesGroup = game.add.group();
    for(var i = 0; i < 19; ++i) {
        let x = rand(0, width);
        let y = rand(0, height);
        employees.push(new Employee(game, x, y, employeesGroup));
    }
    
    
    playerSprite = game.add.graphics(width/2, height/2);
    playerSprite.beginFill(0xFF0000, 0.5);
    playerSprite.drawCircle(0, 0, 40);
    playerSprite.anchor.set(0.5, 0.5);
    game.physics.arcade.enable(playerSprite);
    playerSprite.body.collideWorldBounds = true;
    
    player.add(playerSprite);

    createUi();
}

function update() {
    movePlayer();

    collisionDetection();
    playerUseAction();
    
    moveEmployees();
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
  let wallY = 180;
  let doorWidth = 65;

  let lines = [
    [entranceRightX, 0, 0, wallY],
    [width/2-50, 0, 0, wallY],
    [entranceRightX, wallY, 40, 0],
    [entranceRightX+40+doorWidth, wallY, meetingRoomX-entranceRightX-40-doorWidth, 0],
    [meetingRoomX, 0, 0, wallY],
    [meetingRoomX+doorWidth, wallY, width-meetingRoomX-doorWidth, 0],
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
}

function moveEmployees() {
    employees.forEach(employee => employee.move());
}
