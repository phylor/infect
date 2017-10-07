let width = 800;
let height = 600;
let tilesize = 50;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });

var cursors, useKey;
var player;
var desks = [];
var action, actionText, actionTarget;

var employeesGroup;
var employees = [];

class Action {
    
    constructor(x, y, playerGroup, text, actionCallback) {
        this.x = x;
        this.y = y;
        this.playerGroup = playerGroup;
        this.text = text;
        this.actionCallback = actionCallback;
        
        this.group = game.add.group();
        
        this.box = game.add.graphics(0, 0);
        this.box.beginFill(0x000000, 1);
        this.box.drawRect(x, y, x + 70, y + 20);
        this.box.anchor.set(0.5, 0.5);
        
        this.text = game.add.text(x, y, "[E] Infect", { fill: "#fff", font: "16px" });
        this.text.anchor.set(0.5, 0.5);
        
        this.group.add(this.box);
        this.group.add(this.text);
        
        player.add(this.group);
    }
    
    hide() {
        this.group.visible = false;
    }
    
    show() {
        this.group.visible = true;
    }
    
    isActive() {
        return this.group.visible;
    }
}

class Desk {
    
    constructor(x, y) {
        this.desk = game.add.graphics(x, y);
        this.desk.beginFill(0xFF0000, 1);
        this.desk.drawRect(0, 0, 100, 50);
        
        this._isInfected = false;
    }
    
    sprite() {
        return this.desk;
    }
    
    infect() {
        this._isInfected = true;
        
        this.desk.destroy();
        this.desk = game.add.graphics(this.desk.x, this.desk.y);
        this.desk.beginFill(0x00FF00, 1);
        this.desk.drawRect(0, 0, 100, 50);
    }
    
    isInfected() {
        return this._isInfected;
    }
}

class Employee {
    
    constructor(x, y, group) {
        this.employeeSprite = game.add.graphics(x, y);
        this.employeeSprite.beginFill(0x0000FF, 1);
        this.employeeSprite.drawCircle(0, 0, 30);
        this.employeeSprite.alpha = 0.5;
        
        this.isInfected = false;
    }
    
    sprite() {
        return this.employeeSprite;
    }
    
    move() {
        if(this.isInfected)
            return;
        
        let x = rand(0, 10) - 4.5;
        let y = rand(0, 10) - 4.5;
        
        this.employeeSprite.x += x;
        this.employeeSprite.y += y;
        
        if(this.employeeSprite.x < 0) this.employeeSprite.x = 0;
        if(this.employeeSprite.x > width) this.employeeSprite.x = width;
        if(this.employeeSprite.y < 0) this.employeeSprite.y = 0;
        if(this.employeeSprite.y > height) this.employeeSprite.y = height;
    }
    
    infect() {
        if(!this.isInfected) {
            this.employeeSprite.destroy();
            
            this.employeeSprite = game.add.graphics(this.employeeSprite.x, this.employeeSprite.y);
            this.employeeSprite.beginFill(0x00FF00, 1);
            this.employeeSprite.drawCircle(0, 0, 30);
            this.employeeSprite.alpha = 0.5;
        }
        
        this.isInfected = true;
    }
}

function preload() {
    game.load.image('floor', '/assets/gfx/office_floor.svg');
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
    
    desks.push(new Desk(width-100, 20));
    desks.push(new Desk(width-100, 75));
    
    desks.push(new Desk(width-100, 145));
    desks.push(new Desk(width-100, 200));
    
    employeesGroup = game.add.group();
    for(var i = 0; i < 19; ++i) {
        let x = rand(0, width);
        let y = rand(0, height);
        employees.push(new Employee(x, y, employeesGroup));
    }
    
    player = game.add.group();
    
    var playerSprite = game.add.graphics(0, 0);
    playerSprite.beginFill(0xFF0000, 0.5);
    playerSprite.drawCircle(0, 0, 40);
    playerSprite.x = 0;
    playerSprite.y = 0;
    
    player.add(playerSprite);
    
    var actionX = player.x + player.width / 2;
    var actionY = player.y + player.height / 2;
        
    action = new Action(actionX, actionY, player, "[E] Infect", function() {});
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

    for(var i = 0; i < desks.length; ++i) {
        var desk = desks[i];
        
        if(checkOverlap(player, desk.sprite())) {
            if(!desk.isInfected()) {
                showInfectionAction(player, desk);
                actionTarget = desk;
            }
        }
        else {
            if(action) {
                action.hide();
            }

            actionTarget = null;
        }
    }
    
    if(useKey.isDown) {
        if(action && action.isActive() && actionTarget) {
            actionTarget.infect();
            action.hide();
            actionTarget = null;
        }
    }
    
    checkInfections();
    
    moveEmployees();
}

function showInfectionAction(player, desk) {
    action.show();
}

function checkOverlap(spriteA, spriteB) {
    var boundsA = spriteA.getBounds();
    var boundsB = spriteB.getBounds();
    
    return Phaser.Rectangle.intersects(boundsA, boundsB);
}

function rand(from, to) {
    return Math.floor(Math.random() * to) + from;
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
