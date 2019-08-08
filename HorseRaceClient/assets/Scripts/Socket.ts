import {GLB} from "./GLBConfig";

var ws = null;
var WS = {
    ws: ws,
    obj: null,
    sendMsg: null,
    close: null,
    reconnect: null,
    tt: null,
};
var bError = false;
var lockReconnect = false;
var heartCheck = {
    timeout: 30000,
    timeoutObj: null,
    serverTimeoutObj: null,
    start: function(){
      var self = this;
      this.timeoutObj && clearTimeout(this.timeoutObj);
      this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
      this.timeoutObj = setTimeout(function(){
        //这里发送一个心跳，后端收到后，返回一个心跳消息，
        //onmessage拿到返回的心跳就说明连接正常
        ws.send("0");
        self.serverTimeoutObj = setTimeout(function() {
            console.log(GLB.getTime()+"heart-timeout");
          ws.close();
        }, self.timeout);
      }, this.timeout)
    }
}
var creatWS = function () {
    ws = null;
    ws = new WebSocket("ws://"+GLB.ip+"/websocket");
    // ws = new WebSocket("wss://websocket.windgzs.cn/websocket"); //wx/ios
    WS.ws = ws;
    ws.onopen = function (event) {
        console.log(GLB.getTime()+"Send Text WS was opened.");
        if (GLB.msgBox) GLB.msgBox.active = false;
        heartCheck.start();
    };
    ws.onmessage = function (event) {
        heartCheck.start();
        var data = event.data;
        if (data == "0") return;
        console.log(GLB.getTime()+"response text msg = " + data);
        var i1 = data.indexOf(":");
        if (i1 == -1 || WS.obj == null) return;
        var cmd = data.substring(0, i1);
        var sResponse = data.substring(i1+1);
        WS.obj.onResponse(cmd, sResponse);
    };
    ws.onerror = function (event) {
        console.log(GLB.getTime()+"Send Text fired an error.", event);
        bError = true;
    };
    ws.onclose = function (e) {
        if (e.code && e.code.toString() != "1001" && GLB.msgBox) GLB.msgBox.active = true;
         console.log(GLB.getTime()+"WebSocket instance closed.", e.code + ' ' + e.reason + ' ' + e.wasClean);
         if (bError == false) WS.reconnect();
    };
}
WS.sendMsg = function (cmd: string, msg: string, obj) {
    if (cmd == null) return;
    if (ws.readyState === WebSocket.OPEN) {
        if (cmd == "0"){
            ws.send(cmd);
            return;
        }
        msg = msg || "";
        var str = cmd + ":" + msg.toString();
        console.log(GLB.getTime()+"sendMsg = ", str);
        ws.send(str);
        if (obj != null){
            WS.obj = obj;
        }
        return true;
    }else {
        console.log(GLB.getTime()+"WebSocket instance wasn't ready...");
        if (GLB.msgBox) GLB.msgBox.active = true;
        return false;
    }
};
WS.close = function () {
    ws.close();
};
WS.reconnect = function () {
    if (lockReconnect) return;
    lockReconnect = true;
    this.tt && clearTimeout(this.tt);
    this.tt = setTimeout(()=>{
        bError = false;
        creatWS();
        lockReconnect = false;
    }, 4000)
};
creatWS();
export {WS};