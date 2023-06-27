/* 存放全局变量 */
var GLB = {
    ip: "robot518.com:8081",
    // ip: "47.111.184.119:8082",
    // ip: "127.0.0.1:8081",
    isClickCd: false,
    msgBox: null,
    usrId: null,
    userInfo: null,
    otherInfo: null,
    OpenID: "",
    withCredentials: false,
    iHorse: null, //第几种马
    bSpView: false, //刘海屏

    //event
    WXLOGIN: "wxLogin",
    MATCH: "match",
    LOSE: "lose",
    QUIT: "quit",

    getTime(){
        let s = "[";
        let now = new Date();
        let hh = now.getHours();
        let mm = now.getMinutes();
        let ss = now.getSeconds();
        if (hh < 10) s+='0';
        s+=hh+":";
        if (mm < 10) s+="0";
        s+=mm+":";
        if (ss < 10) s+="0";
        s+=ss+"]";
        return s;
    }
};
export {GLB};