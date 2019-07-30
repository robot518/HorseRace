const {ccclass, property} = cc._decorator;

import {GLB} from "./GLBConfig";
import {WS} from "./Socket";

@ccclass
export default class Lobby extends cc.Component {

    @property(cc.Node)
    ndMatch: cc.Node = null;

    @property({
        type: cc.AudioClip
    })
    audioClick: cc.AudioClip = null;

    _iLv: number = 1;
    _videoAd: any;
    _bannerAd: any;
    _bLoaded: boolean;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.initCanvas();
        this.initParas();
        this.initEvent();
        this.initShow();
    }

    // update (dt) {}

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
        this._bLoaded = false;
    }

    initEvent(){
        cc.find("start", this.node).on("click", function (argument) {
            this.playSound("click");
            this.ndMatch.active = true;
            WS.sendMsg(GLB.MATCH, "", this);
            // cc.director.loadScene("Level", function (err, scene) {
            //     var obj = scene.getChildByName("Canvas").getComponent("Level");
            // });
        }, this);
        // cc.find("share", this.node).on("click", function (argument) {
        //     this.playSound("click");
        //     this.onWxEvent("share");
        // }, this);
        // this.onWxEvent("initBanner");
        // this.onWxEvent("initVideo");
        // if (CC_WECHATGAME && cc.sys.os === cc.sys.OS_ANDROID){
        //     var self = this;
        //     wx.onShow(()=>{
        //         // console.log("self.music.isPlaying = " + (self.music && self.music.isPlaying));
        //         if (self.music) self.music.play();
        //     });
        // }
    }

    initShow(){

    }

    onResponse(cmd, msg){
        var args = msg.split("|");
        if (cmd == GLB.REGISTER || cmd == GLB.LOGIN){
            // if (msg == "200"){ //成功
            //     this.ndRegister.active = false;
            //     this.initGLBData();
            //     WS.sendMsg(GLB.GET_SCORE, GLB.sName, this);
            // } else
            //     this.playTips(msg);
        }else if (cmd == GLB.MATCH){
            cc.director.loadScene("Level", function (err, scene) {
                var obj = scene.getChildByName("Canvas").getComponent("Level");
                WS.obj = obj;
            });
        }
    }

    onWxEvent(s){
        if (!CC_WECHATGAME) return;
        switch(s){
            case "initBanner":
                // if (this._bannerAd != null)
                //     this._bannerAd.destory();
                // var systemInfo = wx.getSystemInfoSync();
                // this._bannerAd = wx.createBannerAd({
                //     adUnitId: 'adunit-24778ca4dc4e174a',
                //     style: {
                //         left: 0,
                //         top: systemInfo.windowHeight - 144,
                //         width: 720,
                //     }
                // });
                // var self = this;
                // this._bannerAd.onResize(res => {
                //     if (self._bannerAd)
                //         self._bannerAd.style.top = systemInfo.windowHeight - self._bannerAd.style.realHeight;
                // })
                // this._bannerAd.show();
                // this._bannerAd.onError(err => {
                //   console.log(err);
                //   //无合适广告
                //   if (err.errCode == 1004){

                //   }
                // })
                break;
            case "initVideo":
                // this._videoAd = wx.createRewardedVideoAd({
                //     adUnitId: 'adunit-a7fcb876faba0c89'
                // });
                // this._videoAd.onClose(res => {
                //     if (res && res.isEnded || res === undefined){
                //         this.loadMusic();
                //     }else{

                //     }
                // });
                // this._videoAd.onError(err => {
                //   console.log(err)
                // });
                break;
            case "share":
                // var id = '' // 通过 MP 系统审核的图片编号
                // var url = '' // 通过 MP 系统审核的图片地址
                // wx.shareAppMessage({
                //     imageUrlId: id,
                //     imageUrl: url
                // })
                wx.shareAppMessage({
                    title: "你来挑战我啊！",
                    imageUrl: canvas.toTempFilePathSync({
                        destWidth: 500,
                        destHeight: 400
                    })
                });
                break;
            case "showVideo":
                // if (self._videoAd != null){
                //     self._videoAd.show()
                //     .catch(err => {
                //         self._videoAd.load()
                //         .then(() => self._videoAd.show())
                //     })
                // }
                break;
        }
    }

    playSound(sName){
        if (sName == "click") cc.audioEngine.play(this.audioClick, false, 1);
    }
}
