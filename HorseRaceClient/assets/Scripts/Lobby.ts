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
    _bTest: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.initCanvas();
        this.initParas();
        this.initEvent();
        this.initShow();
        this.initMsgBox();
        // WS.sendMsg(GLB.WXLOGIN, "qwer&1&2");
    }

    update (dt) {
        if (this._bMatch){
            this._iTime+=dt;
            this.showTime();
            if (this._iTime > 10){
                this._bMatch = false;
                this._iTime = 0;
                WS.sendMsg(GLB.QUIT, GLB.OpenID, this);
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
        if (GLB.OpenID == "") GLB.OpenID = Math.random().toFixed(6);
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
            if (this._videoAd != null) this._videoAd.show();
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
        if (CC_WECHATGAME){
            let invite = cc.find("invite", this.ndMatch);
            invite.active = true;
            invite.on("click", function (params) {
                this.onWxEvent("invite");
            }, this);
            let share = cc.find("share", this.node);
            share.active = true;
            share.on("click", function (argument) {
                this.playSound("click");
                this.onWxEvent("share");
            }, this);

            this.onWxEvent("login");
            this.onWxEvent("onShow");
            this.onWxEvent("initBanner");
            this.onWxEvent("initVideo");
        }
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

    onWxEvent(s){
        if (!CC_WECHATGAME) return;
        let self = this;
        switch(s){
            case "initBanner":
                if (this._bannerAd != null) this._bannerAd.show();
                else {
                    var systemInfo = wx.getSystemInfoSync();
                    this._bannerAd = wx.createBannerAd({
                        adUnitId: 'adunit-68a8244d86c7bf29',
                        style: {
                            left: 0,
                            top: systemInfo.windowHeight - 144,
                            width: 720,
                        }
                    });
                    this._bannerAd.onResize(res => {
                        if (self._bannerAd)
                            self._bannerAd.style.top = systemInfo.windowHeight - self._bannerAd.style.realHeight;
                    })
                    this._bannerAd.show();
                    this._bannerAd.onError(err => {
                        console.log(err);
                        //无合适广告
                        if (err.errCode == 1004){

                        }
                    })
                }
                break;
            case "initVideo":
                this._videoAd = wx.createRewardedVideoAd({
                    adUnitId: 'adunit-832cda6401b268ef'
                });
                this._videoAd.onClose(res => {
                    if (res && res.isEnded || res === undefined){
                        GLB.iHorse = self._iHorse;
                        self.ndShop.active = false;
                        self.onMatch();
                    }else{

                    }
                });
                this._videoAd.onError(err => {
                  console.log(err)
                });
                break;
            case "invite":
                wx.shareAppMessage({
                    title: "邀请对战！",
                    imageUrl: canvas.toTempFilePathSync({
                        destWidth: 500,
                        destHeight: 400
                    }),
                    query: GLB.OpenID,
                });
                break;
            case "onShow":
                wx.onShow(function (res) {
                    console.log("res.query=", res.query);
                });
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
                if (self._videoAd != null){
                    self._videoAd.show()
                    .catch(err => {
                        self._videoAd.load()
                        .then(() => self._videoAd.show())
                    })
                }
                break;
            case "auth":
                wx.getSetting({
                    success(res) {
                        if (!res.authSetting['scope.userInfo']) {
                            let dSize = self.node.getComponent(cc.Canvas).designResolution;
                            self.UserInfoButton = wx.createUserInfoButton({
                                type: 'text',
                                text: '',
                                withCredentials: GLB.withCredentials,
                                style: {
                                    left: 0,
                                    top: 0,
                                    width: dSize.width,
                                    height: dSize.height,
                                }
                            })
                            self.UserInfoButton.onTap((res) => {
                                // console.log("Res = ", res);s
                                if (res.userInfo){
                                    GLB.userInfo = res.userInfo;
                                    let str = GLB.OpenID+"&"+res.userInfo.nickName+"&"+res.userInfo.avatarUrl;
                                    if (WS.sendMsg(GLB.WXLOGIN, str)){
                                        // self.onMatch();
                                        self.UserInfoButton.hide();
                                    }
                                }
                            })
                        }else{
                            wx.getUserInfo({
                                withCredentials: GLB.withCredentials,
                                success(res){
                                    // console.log("Res = ", res);
                                    GLB.userInfo = res.userInfo;
                                    let str = GLB.OpenID+"&"+res.userInfo.nickName+"&"+res.userInfo.avatarUrl;
                                    WS.sendMsg(GLB.WXLOGIN, str);
                                }
                            })
                        }
                    }
                })
                break;
            case "login":
                // cc.sys.localStorage.setItem("OpenID", null);
                GLB.OpenID = cc.sys.localStorage.getItem("OpenID");
                // console.log("OpenID2 = ", GLB.OpenID);
                if (GLB.OpenID){
                    if (!GLB.userInfo) this.onWxEvent("auth");
                }else {
                    wx.login({
                        success (res) {
                            if (res.code) {
                                //发起网络请求
                                // console.log("code = ", res.code);
                                wx.request({
                                    // url: 'http://'+GLB.ip,
                                    // url: "https://websocket.windgzs.cn/HorseRace/",
                                    url: "https://websocket.guanzhiwangluogongyi.vip/",
                                    data: {
                                        code: res.code
                                    },
                                    success(response){
                                        // console.log("success response = ", response);
                                        // console.log("OpenID = ", response.data);
                                        GLB.OpenID = response.data;
                                        cc.sys.localStorage.setItem("OpenID", response.data);
                                        self.onWxEvent("auth");
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
                }
                // wx.checkSession({ //用于检测SessionKey是否过期
                //     success () {
                //         //session_key 未过期，并且在本生命周期一直有效
                //         if (!GLB.userInfo) this.onWxEvent("auth");
                //     },
                //     fail () {
                //         // session_key 已经失效，需要重新执行登录流程
                        
                //     }
                // })
                break;
        }
    }

    playSound(sName){
        if (sName == "click") cc.audioEngine.play(this.audioClick, false, 1);
    }

    onMatch(){
        if (WS.sendMsg(GLB.MATCH, GLB.OpenID, this))
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
