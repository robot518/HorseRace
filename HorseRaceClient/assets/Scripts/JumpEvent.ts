const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    ndLevel: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}

    onJumpDown(){
        this.node.getComponent(cc.Animation).play("run");
        this.ndLevel.getComponent("Level").onJumpDown();
    }
        
}
