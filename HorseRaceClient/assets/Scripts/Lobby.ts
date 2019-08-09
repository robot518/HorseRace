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
        this.initMsgBox();
        this.onWxEvent("auth");
        this.onWxEvent("login");
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
        cc.find("btnShop", this.node).on("click", function (argument) {
            this.ndShop.active = true;
        }, this);
        cc.find("ndShop", this.node).on("click", function (params) {
            this.ndShop.active = false;
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
        WS.sendMsg("0");
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
        var args = msg.split("|");
        // if (cmd == GLB.REGISTER || cmd == GLB.LOGIN){
        //     // if (msg == "200"){ //成功
        //     //     this.ndRegister.active = false;
        //     //     this.initGLBData();
        //     //     WS.sendMsg(GLB.GET_SCORE, GLB.sName, this);
        //     // } else
        //     //     this.playTips(msg);
        // }else 
        if (cmd == GLB.MATCH){
            let res = {"nickName": args[0], "avatarUrl": args[1]};
            this.showMatchOther(res);
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
                                // withCredentials: false,
                                style: {
                                    left: size.width/2-width/2,
                                    top: size.height/2-self.btnMatch.y*size.height/dSize.height-height/2,
                                    width: width,
                                    height: height,
                                }
                            })
                            self.UserInfoButton.onTap((res) => {
                                // console.log("Res = ", res);
                                GLB.userInfo = res.userInfo;
                                let str = res.userInfo.nickName+"|"+res.userInfo.avatarUrl;
                                if (WS.sendMsg(GLB.WXLOGIN, str)){
                                    self.onMatch();
                                    self.UserInfoButton.hide();
                                }
                            })
                        }else{
                            wx.getUserInfo({
                                success(res){
                                    // console.log("Res = ", res);
                                    GLB.userInfo = res.userInfo;
                                    let str = res.userInfo.nickName+"|"+res.userInfo.avatarUrl;
                                    WS.sendMsg(GLB.WXLOGIN, str);
                                }
                            })
                        }
                    }
                })
                break;
            case "login":
                wx.login({
                    success (res) {
                        if (res.code) {
                            //发起网络请求
                            console.log("code = ", res.code);
                            wx.request({
                                url: 'http://'+GLB.ip,
                                data: {
                                    code: res.code
                                },
                                success(response){
                                    console.log("success response = ", response);
                                    console.log("OpenID = ", response.data);
                                    GLB.OpenID = response.data;
                                    // cc.sys.localStorage.setItem("usrId", response.data);
                                    // GLB.usrId = cc.sys.localStorage.getItem("usrId") || null;
                                },
                                fail(response){
                                    console.log("fail response = ", response);
                                }
                            })
                        } else {
                            console.log('登录失败！' + res.errMsg)
                        }
                    }
                })
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
        if (WS.sendMsg(GLB.MATCH, GLB.OpenID, this)){
            this.ndMatch.active = true;
            if (GLB.userInfo){
                let me = this.ndMatch.getChildByName("me");
                me.getChildByName("name").getComponent(cc.Label).string = this.getStrName(GLB.userInfo.nickName);
                cc.loader.load({ url: GLB.userInfo.avatarUrl, type: "png" }, (error, texture) => {
                    me.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                });
            }
        }
    }

    showMatchOther(res){
        GLB.otherInfo = res;
        if (GLB.otherInfo && GLB.otherInfo instanceof Object){
            let other = this.ndMatch.getChildByName("other");
            other.getChildByName("name").getComponent(cc.Label).string = this.getStrName(GLB.otherInfo.nickName);
            if (GLB.otherInfo.avatarUrl){
                cc.loader.load({ url: GLB.otherInfo.avatarUrl, type: "png" }, (error, texture) => {
                    other.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                });
            }
        }
    }

    getStrName(s: string){
        if (s && s.length > 5) s = s.substring(0, 5)+"...";
        return s || "";
    }
}
