const {ccclass, property} = cc._decorator;

import {GLB} from "./GLBConfig";
import {WS} from "./Socket";

@ccclass
export default class Lobby extends cc.Component {

    @property(cc.Node)
    ndMatch: cc.Node = null;

    @property(cc.Node)
    btnMatch: cc.Node = null;

    @property({
        type: cc.AudioClip
    })
    audioClick: cc.AudioClip = null;

    _iLv: number = 1;
    _videoAd: any;
    _bannerAd: any;
    _bLoaded: boolean;
    UserInfoButton: any;

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
        var self = this;
        this.onWxEvent("auth");
        cc.find("share", this.node).on("click", function (argument) {
            this.playSound("click");
            this.onWxEvent("share");
        }, this);
        this.btnMatch.on("click", function (argument) {
            this.onMatch();
            // cc.director.loadScene("Level", function (err, scene) {
            //     var obj = scene.getChildByName("Canvas").getComponent("Level");
            //     WS.obj = obj;
            // });
        }, this);
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
        if (this.UserInfoButton) this.UserInfoButton.show();
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
            // this.showMatchOther();
            cc.director.loadScene("Level", function (err, scene) {
                var obj = scene.getChildByName("Canvas").getComponent("Level");
                WS.obj = obj;
            });
        }
    }

    onWxEvent(s){
        if (!CC_WECHATGAME) return;
        let self = this;
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
            case "auth":
                wx.getSetting({
                    success(res) {
                        if (!res.authSetting['scope.userInfo']) {
                            // self.btnMatch.active = false;
                            let size = cc.view.getFrameSize();
                            let dSize = self.node.getComponent(cc.Canvas).designResolution;
                            let pix = 1;
                            if (size.width/size.height >= dSize.width/dSize.height){
                                pix = dSize.height/size.height;
                            }else pix = dSize.width/size.width;
                            let width = self.btnMatch.width/pix, height = self.btnMatch.height/pix;
                            // console.log(size, width, height, pix);
                            self.UserInfoButton = wx.createUserInfoButton({
                                type: 'text',
                                text: '',
                                // image: 'http://windgzs.cn/images/play.png',
                                // withCredentials: false,
                                style: {
                                    left: size.width/2-width/2,
                                    top: size.height/2-self.btnMatch.y*size.height/dSize.height-height/2,
                                    width: width,
                                    height: height,
                                    
                                    // backgroundColor: '#ff0000',
                                    // boderColor: '#888888',
                                    // boderWidth: 0,
                                    // borderRadius: 0,
                                    // color: '#ffffff',
                                    // textAlign: 'center',
                                    // fontSize: 16,
                                    // lineHeight: 0,
                                }
                            })
                            self.UserInfoButton.onTap((res) => {
                                GLB.userInfo = res.userInfo;
                                console.log("Res = ", res);
                                self.onMatch();
                                self.UserInfoButton.hide();
                            })
                        }else{
                            wx.getUserInfo({
                                success(res){
                                    console.log("Res = ", res);
                                    GLB.userInfo = res.userInfo;
                                    //   var nickName = userInfo.nickName
                                    //   var avatarUrl = userInfo.avatarUrl
                                    //   var gender = userInfo.gender //性别 0：未知、1：男、2：女
                                    //   var province = userInfo.province
                                    //   var city = userInfo.city
                                    //   var country = userInfo.country
                                }
                            })
                            // self.btnMatch.active = true;
                        }
                    }
                })
                break;
            case "login":
                // wx.login({
            //     success (res) {
            //         if (res.code) {
            //             //发起网络请求
            //             console.log("code = ", res.code);
            //             wx.request({
            //                 url: 'http://127.0.0.1:8080',
            //                 data: {
            //                     code: res.code
            //                 },
            //                 success(response){
            //                     console.log("success response = ", response);
            //                     console.log("usrid = ", response.data);
            //                     // cc.sys.localStorage.setItem("usrId", response.data);
            //                     // GLB.usrId = cc.sys.localStorage.getItem("usrId") || null;
            //                 },
            //                 fail(response){
            //                     console.log("fail response = ", response);
            //                 }
            //             })
            //         } else {
            //             console.log('登录失败！' + res.errMsg)
            //         }
            //     }
            // })
            // wx.checkSession({
            //     fail () {
                    
            //     }
            // })
                break;
        }
    }

    playSound(sName){
        if (sName == "click") cc.audioEngine.play(this.audioClick, false, 1);
    }

    onMatch(){
        this.ndMatch.active = true;
        if (GLB.userInfo){
            let me = this.ndMatch.getChildByName("me");
            me.getChildByName("name").getComponent(cc.Label).string = this.getStrName(GLB.userInfo.nickName);
            cc.loader.load({ url: GLB.userInfo.avatarUrl, type: "png" }, (error, texture) => {
                me.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
            });
        }
        WS.sendMsg(GLB.MATCH, "", this);
    }

    showMatchOther(res){
        // let other = cc.find("other", this.ndMatch);
    }

    getStrName(s: string){
        if (s.length > 5) s = s.substring(0, 5)+"...";
        return s;
    }
}
