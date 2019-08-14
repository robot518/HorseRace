package websocketx;

import redis.clients.jedis.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Set;

public class Redis {
    private JedisPool pool;
    static Redis redis;
    String USERINFO = "userInfo";

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

    public String getUserInfo(String OpenId){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            return jedis.hget(USERINFO, OpenId);
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }

    public void setUserInfo(String OpenId, String userInfo){
        Jedis jedis = null;
        try {
            jedis = getPool().getResource();
            jedis.hset(USERINFO, OpenId, userInfo);
        } finally {
            if (jedis != null) {
                jedis.close();
            }
        }
    }
}
