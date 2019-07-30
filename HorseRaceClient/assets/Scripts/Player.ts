const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    @property(cc.Node)
    ndLv: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}

    onCollisionEnter (other, obj) {
        this.ndLv.getComponent("Level").onCol();
    }
}
