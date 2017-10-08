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
var player;
var desks = [];
var actionText, actionTarget;

var employeesGroup;
var employees = [];



function preload() {
    game.load.image('floor', officeFloor);
}

function create() {
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
    
    
    var playerSprite = game.add.graphics(0, 0);
    playerSprite.beginFill(0xFF0000, 0.5);
    playerSprite.drawCircle(0, 0, 40);
    playerSprite.x = 0;
    playerSprite.y = 0;
    
    player.add(playerSprite);
}

function update() {
    if(cursors.right.isDown) {
        player.x += 5;
    }
    if(cursors.left.isDown) {
        player.x -= 5;
    }
    if(cursors.up.isDown) {
        player.y -= 5;
    }
    if(cursors.down.isDown) {
        player.y += 5;
    }
    
    if(player.x < 0) player.x = 0;
    if(player.x+player.width > width) player.x = width-player.width;
    if(player.y < 0) player.y = 0;
    if(player.y+player.height > height) player.y = height-player.height;

    let overlappingDesks = desks
      .filter(desk => !desk.isInfected())
      .filter(desk => checkOverlap(player, desk.sprite()))
      .map(desk => {
        let intersection = Phaser.Rectangle.intersection(player, desk.sprite());
        let area = intersection.width * intersection.height;

        return [area, desk];
      })
      .sort((a, b) => {
        if(a[0] > b[0])
          return -1;
        else if(a[0] < b[0])
          return 1;
        else
          return 0;
      });

    desks
      .filter(desk => desk != actionTarget)
      .forEach(desk => desk.hideAction());

    if(overlappingDesks.length > 0) {
      let closestDesk = overlappingDesks[0][1];

      closestDesk.showAction();
      actionTarget = closestDesk;
    }
    else {
      if(actionTarget)
        actionTarget.hideAction();

      actionTarget = null;
    }
    
    if(useKey.isDown) {
        if(actionTarget) {
            actionTarget.infect();
            actionTarget.hideAction();
            actionTarget = null;
        }
    }
    
    checkInfections();
    
    moveEmployees();
}

function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    
    return Phaser.Rectangle.intersects(boundsA, boundsB);
}

function createWalls() {
  let entranceRightX = width/2+50;
  let meetingRoomX = width/2+220;
  let toilet1X = 100;
  let toilet2X = 200;
  let wallY = 180;

  let lines = [
    [entranceRightX, 0, 0, wallY],
    [width/2-50, 0, 0, wallY],
    [entranceRightX, wallY, 40, 0],
    [entranceRightX+40+30, wallY, 100, 0],
    [meetingRoomX, 0, 0, wallY],
    [meetingRoomX+30, wallY, width-meetingRoomX-30, 0],
    [toilet1X, 0, 0, wallY],
    [toilet2X, 0, 0, wallY]
  ];

  lines.forEach(line => {
    let wall = game.add.graphics(line[0], line[1]);
    wall.lineStyle(3, 0x000000, 1);
    wall.lineTo(line[2], line[3]);
  });
}

function moveEmployees() {
    employees.forEach(employee => employee.move());
}

function checkInfections() {
    desks
      .filter(desk => desk.isInfected())
      .forEach(desk => {
        employees.forEach(employee => {
          if(checkOverlap(desk.sprite(), employee.sprite()))
            employee.infect();
        });
      });
}
