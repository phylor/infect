export default class Action {
    
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
