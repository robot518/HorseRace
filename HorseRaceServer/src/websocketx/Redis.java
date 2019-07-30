package websocketx;

import redis.clients.jedis.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Set;

public class Redis {
    private JedisPool pool;
    static Redis redis;
    String sKeyScore = "score";
    String sKeyStep = "step";
    String sKeyOnline="key-online";
    String sKeyRegister = "key-register";
    String sKeyActive = "key-active";
    String sKeyVisit = "key-visit";
    String sKeyOnlineTime = "key-onlineTime";
    String sKeyWorldMine = "key-worldMine";

    public static Redis getInstance(){
        if (redis == null){
            redis = new Redis();
        }
        return redis;
    }

    private JedisPool getPool(){
        if (pool == null){
            pool = new JedisPool(new JedisPoolConfig(), "localhost", Protocol.DEFAULT_PORT, Protocol.DEFAULT_TIMEOUT, "1314");
        }
        return pool;
    }

    public boolean setName(String sName, String sPass){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            if (jedis.get(sName) == null) {
                jedis.set(sName, sPass);
                return true;
            }
            return false;
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public String getName(String sName){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            return jedis.get(sName);
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public String getWorld(String sIdx, String sRank){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            long lRank = -1-Long.parseLong(sRank);
            if ((-lRank + 1) > jedis.zcard(sKeyScore+sIdx)) //超出边界
                return "";
            String sName = jedis.zrange(sKeyScore+sIdx, lRank, lRank).iterator().next();
            return jedis.hget(sKeyStep+sIdx, sName);
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public String getStep(String sIdx, String sName){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            return jedis.hget(sKeyStep+sIdx, sName);
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public void addStep(String sIdx, String sName, String sStep){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            jedis.hset(sKeyStep+sIdx, sName, sStep);
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public void addScore(String sIdx, String sName, float iScore){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            /// ... do stuff here ... for example
            Double iScorePre = jedis.zscore(sKeyScore + sIdx, sName);
            if (iScorePre == null || iScore < iScorePre)
                jedis.zadd(sKeyScore + sIdx, iScore, sName);
        } finally {
            // You have to close jedis object. If you don't close then
            // it doesn't release back to pool and you can't get a new
            // resource from pool.
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public String getStrScore(String sName){
        if (sName == null || sName == "")
            return "";
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            String str = "";
            for (int i = 0; i < 3; i++){
                String sKeyTemp = sKeyScore+i;
                Long iRank = jedis.zrank(sKeyTemp, sName);
                int iRecommend = 0;
                if (iRank != null) {
                    Double iScore = jedis.zscore(sKeyTemp, sName);
                    str += (iRank+1) + "," + iScore + ",";
                    if (iRank == 0)
                        iRecommend = 1;
                    else if (iRank <= 10)
                        iRecommend = (int) (iRank - 1);
                    else if (iRank <= 100)
                        iRecommend = (int) (iRank - 5);
                    else if (iRank <= 200)
                        iRecommend = (int) (iRank - 10);
                    else if (iRank <= 500)
                        iRecommend = (int) (iRank - 50);
                    else if (iRank <= 1000)
                        iRecommend = (int) (iRank - 100);
                    else {
                        Long iCount = jedis.zcard(sKeyTemp);
                        iRecommend = iCount >= 200 ? 200 : (int) (iCount - 0);
                    }
                }else{
                    str += ",,";
                }
                Set<Tuple> st = jedis.zrangeWithScores(sKeyTemp, iRecommend, iRecommend);
                str += (iRecommend+1) + ",";
                str += st.toString().replace("], [", ",").replace("[", "").replace("]", "");
                if (i != 3)
                    str += "|";
            }
//            System.out.println(str);
            return str;
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public String getStrRank(String sIdx){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            Set<Tuple> stItems = jedis.zrangeWithScores(sKeyScore + sIdx, 0, 9);
            String str = stItems.toString();
            if (str.length() == 2)
                return "";
            str = str.replace("], [", "|");
            str = str.replace("[", "");
            str = str.replace("]", "");
            return str;
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public String Users(){
        Jedis jedis = null;
        try {
            String str = "";
            jedis = getPool().getResource();
            Set<String> setKeys = jedis.keys("*");
            str+=setKeys.size()+setKeys.toString()+"\n";
            for (int i=0; i<3; i++){
                String strKey = sKeyStep+i;
                Set<String> setScore0 = jedis.hkeys(strKey);
                str+=strKey+"="+jedis.hlen(strKey)+setScore0.toString()+"\n";
            }
            return str;
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public String Records(String sDate, long iCount){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            long lActive = jedis.scard(sKeyActive+sDate);
            String str = sDate+"\n活跃用户:"+lActive+"\t注册用户:"+jedis.hget(sKeyRegister, sDate)+"\t在线用户:"+jedis.zcard(sKeyOnline)+"\t连接数:"+iCount;
            if (sDate.length() != 0){
                String sVisit = jedis.hget(sKeyVisit, sDate);
                if (sVisit != null){
                    long lVisit = Long.parseLong(sVisit);
                    long lOnlineTime = Long.parseLong(jedis.hget(sKeyOnlineTime, sDate));
                    str += "\t访问次数:"+sVisit+"\t人均访问次数:"+lVisit/lActive+"\t人均停留时长:"+lOnlineTime/lActive;
                    str += "\n实时访问次数:" + jedis.hgetAll(sKeyVisit+sDate);
                }
            }else{
                long lOnlineTime = Long.parseLong(jedis.hget(sKeyOnlineTime, "2019"));
                str += "\t人均停留时长:"+lOnlineTime/lActive;
            }
            str += "\n在线用户:" + jedis.zrangeWithScores(sKeyOnline, 0, -1);
            return str;
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public void setRecord(String sDate, String sAddress, long lTime){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            if (lTime < 0) {
                lTime = 0;
                jedis.hincrBy(sKeyVisit, sDate,1); //单日访问次数
                String sTime = new SimpleDateFormat("HHmm").format(new Date());
                String sHour = sTime.substring(0, 2);
                jedis.hincrBy(sKeyVisit+sDate, sHour,1); //单日实时访问次数
                jedis.zadd(sKeyOnline, Integer.parseInt(sTime), sAddress); //用户在线
            }else
                jedis.zrem(sKeyOnline, sAddress); //用户下线

            String sKey = sKeyActive+sDate;
            jedis.sadd(sKey, sAddress); //单日在线数
            jedis.hincrBy(sKeyOnlineTime, sDate, lTime); //单日在线时长

            long lAdd = jedis.sadd(sKeyActive, sAddress); //总在线用户数
            if (lAdd == 1){ //新增
                jedis.hincrBy(sKeyRegister, sDate,1); //单日注册用户
            }
            jedis.hincrBy(sKeyOnlineTime, "2019", lTime); //2019总在线时长
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }
}
