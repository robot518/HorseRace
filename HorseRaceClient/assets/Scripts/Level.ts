const {ccclass, property} = cc._decorator;

import {GLB} from "./GLBConfig";
import {WS} from "./Socket";

let second = 2;
let SPEED = 720/second;
//srcvp(585,720) desvp(-355,-720)
let SPEEDX = SPEED*(585+355)/(720+720);
let TTIME = [0,1,3,4,6,7,8,9];
let TLINES = [0,1,0,1,0,1,0,1];

@ccclass
export default class Level extends cc.Component {

    @property(cc.Node)
    p1: cc.Node = null;

    @property([cc.Node])
    lines: cc.Node[] = [];

    @property([cc.Node])
    lines2: cc.Node[] = [];

    @property(cc.Node)
    ndResult: cc.Node = null;

    @property(cc.Node)
    ndBtn: cc.Node = null;

    @property(cc.AudioSource)
    music: cc.AudioSource = null;

    @property(cc.Label)
    labTime: cc.Label = null;

    @property({
        type: cc.AudioClip
    })
    audioClick: cc.AudioClip = null;

    @property({
        type: cc.AudioClip
    })
    audioWin: cc.AudioClip = null;

    @property({
        type: cc.AudioClip
    })
    audioLose: cc.AudioClip = null;

    @property({
        type: cc.AudioClip
    })
    audioFault: cc.AudioClip = null;
    
    _gameStatus: number; //0准备开始 1游戏中 2游戏结束 3暂停游戏 4音乐中断
    _speed: number;
    _iCount: number;
    _bJump: boolean;
    _iTime: number;
    tTime: number[];
    _iTimeIdx: number;
    tOnRun: any[];
    _iLineIdx: number;
    _iLineIdx2: number;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.initCanvas();
        this.initParas();
        this.initEvent();
        this.initShow();

        // cc.director.getCollisionManager().enabled = true;
        let mgr = cc.director.getCollisionManager();
        mgr.enabled = true;
        mgr.enabledDebugDraw = true;
        mgr.enabledDrawBoundingBox = true;

        let time = 3;
        let self = this;
        var seq = cc.sequence(cc.repeat(
            cc.sequence(cc.delayTime(1),
                cc.callFunc(()=>{
                    time--;
                    self.labTime.string = time.toString();
                })), 2), 
            cc.delayTime(1),
            cc.callFunc(()=>{
                self.gameStart();
                self.labTime.node.parent.active = false;
            }));
        this.labTime.string = time.toString();
        this.labTime.node.runAction(seq);
    }

    update (dt) {
        if (this._gameStatus == 1){
            this._iTime += dt;
            if (this._iTime >= this.tTime[this._iTimeIdx]){
                let line = TLINES[this._iTimeIdx];
                if (line == 0){
                    this.tOnRun.unshift(this.lines[this._iLineIdx]);
                    this._iLineIdx++;
                    if (this._iLineIdx >= 6) this._iLineIdx -= 6;
                }else{
                    this.tOnRun.unshift(this.lines2[this._iLineIdx2]);
                    this._iLineIdx2++;
                    if (this._iLineIdx2 >= 6) this._iLineIdx2 -= 6;
                }
                this._iTimeIdx++;
            }
            for (let i = this.tOnRun.length-1; i >= 0; i--){
                let nd = this.tOnRun[i];
                nd.y -= this._speed*dt;
                nd.x -= SPEEDX*dt;
                if (nd.y < -720){
                    nd.y = 720;
                    nd.x = 585
                    this.tOnRun.pop();
                }
            }
        }
    }

    initCanvas(){
        var canvas = this.node.getComponent(cc.Canvas);
        var size = canvas.designResolution;
        var cSize = cc.view.getFrameSize();
        if (cSize.width/cSize.height >= size.width/size.height){
            canvas.fitWidth = false;
            canvas.fitHeight = true;
        }else{
            canvas.fitWidth = true;
            canvas.fitHeight = false;
        }
    }

    initParas(){
        this._gameStatus = 0;
    }

    initEvent(){
        this.ndBtn.on("click", function (argument) {
            if (this._gameStatus == 0){
                // this.gameStart();
            }else if (this._gameStatus == 1){
                if (this._bJump == true) return;
                this.jump();
            } else if (this._gameStatus == 3){
                // this._gameStatus = 1;
            }
        }, this);
        cc.find("back", this.ndResult).on("click", function (argument) {
            cc.director.loadScene("Lobby");
        }, this);
    }

    initShow(){
        this.labTime.node.parent.active = true;
        for (let i = 0; i < 5; i++){
            let nd = cc.instantiate(this.lines[0]);
            nd.parent = this.lines[0].parent;
            this.lines.push(nd);
            let nd2 = cc.instantiate(this.lines2[0]);
            nd2.parent = this.lines[0].parent;
            this.lines2.push(nd2);
        }
    }

    onResponse(cmd, msg){
        var args = msg.split("|");
        if (cmd == GLB.LOSE){
            this.music.stop();
            this.playSound("win");
            this.gameOver("赢了");
        }
    }

    onJumpDown(){
        this._bJump = false;
        this.music.play();
    }

    jump(){
        // var self = this;
        this._bJump = true;
        this.music.stop();
        // let anim = this.p1.getComponent(cc.Animation);
        // var cb = cc.callFunc(()=>{
        //     self._bJump = false;
        //     self.music.play();
        //     anim.play("run");
        // })
        // var seq = cc.sequence(cc.delayTime(1), cb);
        // this.p1.runAction(seq);
        // anim.play("jump");
        this.p1.getComponent(cc.Animation).play("jump");
    }

    showResult(str){
        cc.find("lab", this.ndResult).getComponent(cc.Label).string = str;
    }

    gameStart(){
        var anim1 = this.p1.getComponent(cc.Animation);
        anim1.play();
        this._speed = SPEED;
        this._gameStatus = 1;
        this._iCount = 0;
        this._bJump = false;
        this.music.play();
        this._iTime = 0;
        this.tTime = TTIME;
        this._iTimeIdx = 0;
        this._iLineIdx = 0;
        this._iLineIdx2 = 0;
        this.tOnRun = [];
    }

    gameOver(str){
        this._gameStatus = 2;
        // this.ndResult.active = true;
        // this.p1.active = false;
        // this.showResult(str);
    }

    playSound(sName){
        switch(sName){
            case "click":
                cc.audioEngine.play(this.audioClick, false, 1);
                break;
            case "win":
                cc.audioEngine.play(this.audioWin, false, 1);
                break;
            case "lose":
                cc.audioEngine.play(this.audioLose, false, 1);
                break;
            case "fault":
                cc.audioEngine.play(this.audioFault, false, 1);
                break;
        }
    }

    onCol(){
        WS.sendMsg(GLB.LOSE);
        this.music.stop();
        this.playSound("fault");
        this._gameStatus = 2;
        let anim1 = this.p1.getComponent(cc.Animation);
        anim1.stop();
        let self = this;
        this.labTime.scheduleOnce(function (argument) {
            self.playSound("lose");
            self.gameOver("输了");
        }, 1)
    }
}
