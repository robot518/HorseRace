import {GLB} from "./GLBConfig";

var ws = null;
var WS = {
    ws: ws,
    obj: null,
    sendMsg: null,
    close: null,
    reconnect: null,
};
var bInter = false; //判断是否已经开始心跳包
var bError = false;
var creatWS = function () {
    ws = null;
    // ws = new WebSocket("ws://47.111.184.119:8080/websocket");
    ws = new WebSocket("ws://127.0.0.1:8080/websocket");
    // if (CC_WECHATGAME || cc.sys.os === cc.sys.OS_IOS)
    //     ws = new WebSocket("wss://websocket.windgzs.cn/websocket"); //wx/ios
    // else if (cc.sys.os === cc.sys.OS_ANDROID)
    //     ws = new WebSocket("ws://47.107.178.120:8080/websocket"); //anroid其中安卓ssl连不上
    // else
    //     ws = new WebSocket("wss://websocket.windgzs.cn/websocket"); //本地
    WS.ws = ws;
    ws.onopen = function (event) {
     console.log("Send Text WS was opened.");
     if (GLB.msgBox)
        GLB.msgBox.active = false;
     if (bInter == false){
        window.setInterval(function (argument) {
             WS.sendMsg("");
         }, 30000);
        bInter = true;
     }
    };
    ws.onmessage = function (event) {
        var data = event.data;
        console.log("response text msg = " + data);
        var i1 = data.indexOf(":");
        if (i1 == -1) return;
        if (WS.obj == null) return;
        var cmd = data.substring(0, i1);
        var sResponse = data.substring(i1+1);
        WS.obj.onResponse(cmd, sResponse);
    };
    ws.onerror = function (event) {
     console.log("Send Text fired an error.", event);
     bError = true;
    };
    ws.onclose = function (e) {
        if (e.code && e.code.toString() != "1001" && GLB.msgBox)
            GLB.msgBox.active = true;
         console.log("WebSocket instance closed.", e.code + ' ' + e.reason + ' ' + e.wasClean);
         if (bError == false)
            creatWS();
    };
}
WS.sendMsg = function (cmd: string, msg: string, obj) {
    if (cmd == null) return;
    if (ws.readyState === WebSocket.OPEN) {
        msg = msg || "";
        if (cmd == ""){
            ws.send(cmd);
            return;
        }
        var str = cmd + ":" + msg.toString();
        console.log("sendMsg = ", str);
        ws.send(str);
        if (obj != null){
            WS.obj = obj;
        }
    }
    else {
        console.log("WebSocket instance wasn't ready...");
    }
};
WS.close = function () {
    ws.close();
};
WS.reconnect = function () {
    bError = false;
    creatWS();
};
creatWS();
export {WS};