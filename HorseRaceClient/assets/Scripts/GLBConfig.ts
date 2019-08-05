/* 存放全局变量 */
var GLB = {
    ip: "http://47.111.184.119",
    // ip: "127.0.0.1",
    isClickCd: false,
    msgBox: null,
    usrId: null,
    userInfo: null,
    otherInfo: null,

    //event
    REGISTER: "register",
    LOGIN: "login",
    MATCH: "match",
    LOSE: "lose",
    // START: "start",

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