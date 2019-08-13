const {ccclass, property} = cc._decorator;

import {GLB} from "./GLBConfig";
import {WS} from "./Socket";

let second = 2;
let src = cc.v2(585, 380);
let des = cc.v2(-600, -530);
let SPEED = (src.y+290)/second;
let SPEEDX = SPEED*(src.x-des.x)/(src.y-des.y);
let TTIME = [1,3,5,9,10,11,12.8,14,15,15.9,16.8,21,23,24,24.9,25.7,27,29,30,31,36,38,39,40,43,48,49,49.8,50.8,52,53,54,55,55.8,59];
let TLINES = [0,1,0,1,0,1,0,1,1,0,1,0,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,0,1,0,1,1,0,1,0,1,1,0,1,1,0];
const COUNT = 6;

@ccclass
export default class Level extends cc.Component {

    @property(cc.Node)
    p1: cc.Node = null;

    @property(cc.Node)
    mouse: cc.Node = null;

    @property([cc.Node])
    lines: cc.Node[] = [];

    @property([cc.Node])
    lines2: cc.Node[] = [];

    @property(cc.Node)
    ndResult: cc.Node = null;

    @property(cc.Node)
    ndBtn: cc.Node = null;

    @property(cc.SpriteFrame)
    horse2: cc.SpriteFrame = null;

    @property(cc.Label)
    labMeLines: cc.Label = null;

    @property(cc.Label)
    labOtherLines: cc.Label = null;

    @property(cc.Label)
    labTime: cc.Label = null;

    @property(cc.SpriteFrame)
    tHorsePlayers: cc.SpriteFrame[] = [];

    @property(cc.AudioSource)
    music: cc.AudioSource = null;

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
    _iTimeIdx: number;
    tOnRun: cc.Node[];
    _iLineIdx: number;
    _iLineIdx2: number;
    _iTurn: number; //几轮
    _iRand: number;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.initCanvas();
        this.initParas();
        this.initEvent();
        this.initShow();

        cc.director.getCollisionManager().enabled = true;
        // let mgr = cc.director.getCollisionManager();
        // mgr.enabled = true;
        // mgr.enabledDebugDraw = true;
        // mgr.enabledDrawBoundingBox = true;

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
            if (this._iTime >= TTIME[this._iTimeIdx]){
                if (TTIME[this._iTimeIdx] == 21 || TTIME[this._iTimeIdx] == 36 || TTIME[this._iTimeIdx] == 59){
                // if (TTIME[this._iTimeIdx] == 1 || TTIME[this._iTimeIdx] == 10 || TTIME[this._iTimeIdx] == 15){
                    this.tOnRun.unshift(this.mouse);
                }else{
                    let line = TLINES[this._iTimeIdx];
                    if (line == 0){
                        this.tOnRun.unshift(this.lines[this._iLineIdx]);
                        this._iLineIdx++;
                        if (this._iLineIdx >= COUNT) this._iLineIdx -= COUNT;
                    }else if (line == 1){
                        this.tOnRun.unshift(this.lines2[this._iLineIdx2]);
                        this._iLineIdx2++;
                        if (this._iLineIdx2 >= COUNT) this._iLineIdx2 -= COUNT;
                    }
                }
                this._iTimeIdx++;
            }
            for (let i = this.tOnRun.length-1; i >= 0; i--){
                let nd = this.tOnRun[i];
                nd.y -= this._speed*dt;
                nd.x -= SPEEDX*dt;
                if (nd.y < des.y){
                    nd.y = src.y;
                    nd.x = src.x
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
        for (let i = 0; i < COUNT-1; i++){
            let nd = cc.instantiate(this.lines[0]);
            nd.parent = this.lines[0].parent;
            this.lines.push(nd);
            let nd2 = cc.instantiate(this.lines2[0]);
            nd2.parent = this.lines[0].parent;
            this.lines2.push(nd2);
        }
        this.showPlayers();
        if (GLB.iHorse != null){
            this.p1.getComponent(cc.Sprite).spriteFrame = this.tHorsePlayers[GLB.iHorse];
        }else{
            // this._iRand = Math.random();
            this._iRand = 0;
            if (this._iRand > 0.5) this.p1.getComponent(cc.Sprite).spriteFrame = this.horse2;
        }
    }

    onResponse(cmd, msg){
        var args = msg.split("|");
        if (cmd == GLB.LOSE){
            this.music.stop();
            this.playSound("win");
            this.gameOver(1);
        }
    }

    onJumpDown(){
        let anim = this.p1.getComponent(cc.Animation);
        if (GLB.iHorse != null){
            anim.play("run_"+GLB.iHorse);
        }else if (this._iRand > 0.5) anim.play("run2");
        else anim.play();
        this._bJump = false;
        this.music.play();
        this.showLines();
    }

    jump(){
        this._bJump = true;
        this.music.stop();
        let anim = this.p1.getComponent(cc.Animation);
        if (GLB.iHorse != null){
            anim.play("jump_"+GLB.iHorse);
        }else if (this._iRand > 0.5) anim.play("jump2");
        else anim.play("jump");
    }

    gameStart(){
        let anim = this.p1.getComponent(cc.Animation);
        if (GLB.iHorse != null){
            anim.play("run_"+GLB.iHorse);
        }else if (this._iRand > 0.5) anim.play("run2");
        else anim.play();
        this._speed = SPEED;
        this._gameStatus = 1;
        this._iCount = 0;
        this._bJump = false;
        this.music.play();
        this._iTime = 0;
        this._iTimeIdx = 0;
        this._iLineIdx = 0;
        this._iLineIdx2 = 0;
        this._iTurn = 0;
        this.tOnRun = [];
    }

    gameOver(iType){
        this._gameStatus = 2;
        this.ndResult.active = true;
        this.p1.active = false;
        this.showResult(iType);
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
            self.gameOver(0);
        }, 1)
    }

    showPlayers(){
        let top = cc.find("top", this.node);
        if (GLB.userInfo && GLB.userInfo instanceof Object){
            let me = top.getChildByName("me");
            me.getChildByName("name").getComponent(cc.Label).string = this.getStrName(GLB.userInfo.nickName);
            if (GLB.userInfo.avatarUrl){
                cc.loader.load({ url: GLB.userInfo.avatarUrl, type: "png" }, (error, texture) => {
                    me.getChildByName("pic").getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                });
            }
        }
        if (GLB.otherInfo && GLB.otherInfo instanceof Object){
            let other = top.getChildByName("other");
            other.getChildByName("name").getComponent(cc.Label).string = this.getStrName(GLB.otherInfo.nickName);
            if (GLB.otherInfo.avatarUrl){
                cc.loader.load({ url: GLB.otherInfo.avatarUrl, type: "png" }, (error, texture) => {
                    other.getChildByName("pic").getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                });
            }
        }
    }

    getStrName(s: string){
        if (s && s.length > 5) s = s.substring(0, 5)+"...";
        return s || "";
    }

    showResult(iType){
        if (iType == 0) cc.find("lose", this.ndResult).active = true;
        if (GLB.userInfo && GLB.userInfo instanceof Object){
            let me = this.ndResult.getChildByName("me");
            me.getChildByName("name").getComponent(cc.Label).string = this.getStrName(GLB.userInfo.nickName);
            if (GLB.userInfo.avatarUrl){
                cc.loader.load({ url: GLB.userInfo.avatarUrl, type: "png" }, (error, texture) => {
                    me.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                });
            }
        }
        if (GLB.otherInfo && GLB.otherInfo instanceof Object){
            let other = this.ndResult.getChildByName("other");
            other.getChildByName("name").getComponent(cc.Label).string = this.getStrName(GLB.otherInfo.nickName);
            if (GLB.otherInfo.avatarUrl){
                cc.loader.load({ url: GLB.otherInfo.avatarUrl, type: "png" }, (error, texture) => {
                    other.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                });
            }
        }
    }

    showLines(){
        let iLine = this._iTime-2;
        let i = this._iTimeIdx-1;
        for (; i >= 0; i--){
            if (iLine > TTIME[i]){
                iLine = i+1;
                break;
            }
        }
        // console.log(this._iTime, this._iTimeIdx, iLine, this._iTurn);
        if (iLine < 0) iLine = 0;
        else iLine = this._iTurn*TTIME.length+Math.floor(iLine);
        this.labMeLines.string = iLine.toString();
        this.labOtherLines.string = iLine.toString();
        if (i == TTIME.length-1){
            this._iTurn++;
            this._iTimeIdx = 0;
            this._iTime = 0;
        }
    }
}
