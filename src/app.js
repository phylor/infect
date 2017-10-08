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

    desks.push(new Desk(game, width-120, 20, player));
    desks.push(new Desk(game, width-120, 75, player));
    
    desks.push(new Desk(game, width-120, 145, player));
    desks.push(new Desk(game, width-120, 200, player));

    desks.push(new Desk(game, width/2, 200, player));
    
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

function moveEmployees() {
    for(var i = 0; i < employees.length; ++i) {
        employees[i].move();
    }
}

function checkInfections() {
    for(var d = 0; d < desks.length; ++d) {
        var desk = desks[d];
        
        if(!desk.isInfected())
            return;
        
        for(var i = 0; i < employees.length; ++i) {
            if(checkOverlap(employees[i].sprite(), desk.sprite())) {
                employees[i].infect();
            }
        }
    }
}
