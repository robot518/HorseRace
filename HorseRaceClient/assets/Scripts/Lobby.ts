const {ccclass, property} = cc._decorator;

import {GLB} from "./GLBConfig";
import {WS} from "./Socket";

@ccclass
export default class Lobby extends cc.Component {

    @property(cc.Node)
    ndMatch: cc.Node = null;

    @property(cc.Node)
    ndShop: cc.Node = null;

    @property(cc.Node)
    btnMatch: cc.Node = null;

    @property(cc.Label)
    labTime: cc.Label = null;

    @property(cc.Sprite)
    sptHorse: cc.Sprite = null;

    @property(cc.Sprite)
    sptName: cc.Sprite = null;

    @property(cc.SpriteFrame)
    tHorsePic: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    tHorseName: cc.SpriteFrame[] = [];

    @property({
        type: cc.AudioClip
    })
    audioClick: cc.AudioClip = null;

    _iLv: number = 1;
    _videoAd: any;
    _bannerAd: any;
    _bLoaded: boolean;
    UserInfoButton: any;
    _iHorse: number = 0;
    _iTime: number = 0;
    _bMatch: boolean = false;
    _bTest: boolean = true;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.initCanvas();
        this.initParas();
        this.initEvent();
        this.initShow();
        this.initMsgBox();
    }

    update (dt) {
        if (this._bMatch){
            this._iTime+=dt;
            this.showTime();
            if (this._iTime > 10){
                this._bMatch = false;
                this._iTime = 0;
                WS.sendMsg(GLB.QUIT, GLB.OpenID, this);
                cc.director.loadScene("Level", function (err, scene) {
                    var obj = scene.getChildByName("Canvas").getComponent("Level");
                    WS.obj = obj;
                });
            }
        }
    }

    initCanvas(){
        var canvas = this.node.getComponent(cc.Canvas);
        var size = canvas.designResolution;
        var cSize = cc.view.getFrameSize();
        if (cc.sys.os == cc.sys.OS_IOS){ //刘海屏判断
            GLB.bSpView = (cSize.width == 414 && cSize.height == 896)||(cSize.width == 375 && cSize.height == 812);
        }
        // else{
        //     if (cSize.height/cSize.width > 16/9) GLB.bSpView = true;
        // }
        if (GLB.bSpView){
            canvas.fitWidth = true;
            canvas.fitHeight = true;
        }else if (cSize.width/cSize.height >= size.width/size.height){
            canvas.fitWidth = false;
            canvas.fitHeight = true;
        }else{
            canvas.fitWidth = true;
            canvas.fitHeight = false;
        }
    }

    initParas(){
        this._bLoaded = false;
        if (GLB.OpenID == "") {
            GLB.OpenID = Math.random().toFixed(6);
            WS.sendMsg(GLB.WXLOGIN, GLB.OpenID+"&1&2");
            // GLB.OpenID = "qwer";
            //  console.log("GLB.OpenID=",GLB.OpenID+"&1&2"); //0.103762
        }
    }

    initEvent(){
        this.btnMatch.on("click", function (argument) {
            this.playSound("click");
            this.onMatch();
        }, this);
        cc.find("btnShop", this.node).on("click", function (argument) {
            this.playSound("click");
            this.ndShop.active = true;
        }, this);
        this.ndShop.on("click", function (params) {
            this.playSound("click");
            this.ndShop.active = false;
        }, this);
        let shopBg = cc.find("bg", this.ndShop);
        cc.find("btn", shopBg).on("click", function (params) {
            this.playSound("click");
            GLB.iHorse = this._iHorse;
            this.ndShop.active = false;
            this.onMatch();
        }, this);
        cc.find("right", shopBg).on("click", function (params) {
            this.playSound("click");
            this._iHorse++;
            if (this._iHorse > this.tHorseName.length-1) this._iHorse = 0;
            this.showHorse();
        }, this);
        cc.find("left", shopBg).on("click", function (params) {
            this.playSound("click");
            this._iHorse--;
            if (this._iHorse < 0) this._iHorse = this.tHorseName.length-1;
            this.showHorse();
        }, this);
    }

    initShow(){
        if (this._bTest) this.labTime.node.active = true;
    }

    initMsgBox(){
        if (GLB.msgBox == null){
            var msgBox = cc.find("msgBox");
            GLB.msgBox = msgBox;
            cc.game.addPersistRootNode(msgBox);
            cc.find("btn", msgBox).on("click", function (argument) {
                if (GLB.isClickCd) return;
                GLB.isClickCd = true;
                setTimeout(function() {
                    GLB.isClickCd = false;
                }, 1000);
                msgBox.active = false;
                if (WS.ws.readyState !== WebSocket.OPEN) WS.reconnect();
            }, cc.game);
            msgBox.on("click", function (argument) {
                msgBox.active = false;
            }, cc.game);
        }
    }

    onResponse(cmd, msg){
        var args = msg.split("&");
        if (cmd == GLB.MATCH){
            let res = null;
            if (args.length == 2) res = {"nickName": args[0], "avatarUrl": args[1]};
            else res = {"nickName": args[1], "avatarUrl": args[2]};
            this.showMatchOther(res);
            if (this._bannerAd != null) this._bannerAd.hide();
            if (this._videoAd != null) this._videoAd.offClose();
            if (CC_WECHATGAME){
                cc.loader.downloader.loadSubpackage('subAtlas', function (err) {
                    if (err) {
                        return console.error(err);
                    }
                    cc.director.loadScene("Level", function (err, scene) {
                        var obj = scene.getChildByName("Canvas").getComponent("Level");
                        WS.obj = obj;
                    });
                });
            }else{
                cc.director.loadScene("Level", function (err, scene) {
                    var obj = scene.getChildByName("Canvas").getComponent("Level");
                    WS.obj = obj;
                });
            }
        }
    }

    playSound(sName){
        if (sName == "click") cc.audioEngine.play(this.audioClick, false, 1);
    }

    onMatch(){
        if (WS.sendMsg(GLB.MATCH, GLB.OpenID, this) == false) return;
        this._bMatch = true;
        this._iTime = 0;
        this.ndMatch.active = true;
        let me = this.ndMatch.getChildByName("me");
        let str = "";
        if (GLB.userInfo){
            str = this.getStrName(GLB.userInfo.nickName);
            cc.loader.load({ url: GLB.userInfo.avatarUrl, type: "png" }, (error, texture) => {
                if (error) {
                    console.log("load pic error", error);
                    return;
                }
                me.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            });
        }
        me.getChildByName("name").getComponent(cc.Label).string = str;
    }

    showMatchOther(res){
        GLB.otherInfo = res;
        if (GLB.otherInfo && GLB.otherInfo instanceof Object){
            let other = this.ndMatch.getChildByName("other");
            other.getChildByName("name").getComponent(cc.Label).string = this.getStrName(GLB.otherInfo.nickName);
            if (GLB.otherInfo.avatarUrl){
                cc.loader.load({ url: GLB.otherInfo.avatarUrl, type: "png" }, (error, texture) => {
                    if (error) {
                        console.log("load pic error", error);
                        return;
                    }
                    other.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                });
            }
        }
    }

    getStrName(s: string){
        if (s && s.length > 5) s = s.substring(0, 5)+"...";
        return s || "";
    }

    showHorse(){
        this.sptHorse.spriteFrame = this.tHorsePic[this._iHorse];
        this.sptName.spriteFrame = this.tHorseName[this._iHorse];
    }

    showTime(){
        this.labTime.string = this._iTime.toFixed(0);
    }
}
