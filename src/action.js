export default class Action {
    
    constructor(game, x, y, parentGroup, text, actionCallback) {
        this.game = game;

        this.x = x;
        this.y = y;
        this.text = text;
        this.actionCallback = actionCallback;
        
        this.group = this.game.add.group();
        
        this.box = this.game.add.graphics(0, 0);
        this.box.beginFill(0x000000, 1);
        this.box.drawRect(x, y, 70, 20);
        
        this.text = this.game.add.text(x, y, "[E] Infect", { fill: "#fff", font: "16px" });
        
        this.group.add(this.box);
        this.group.add(this.text);
        
        parentGroup.add(this.group);
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
