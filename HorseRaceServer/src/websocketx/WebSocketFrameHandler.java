/*
 * Copyright 2012 The Netty Project
 *
 * The Netty Project licenses this file to you under the Apache License,
 * version 2.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
package websocketx;

import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketFrame;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Echoes uppercase content of text frames.
 */
public class WebSocketFrameHandler extends SimpleChannelInboundHandler<WebSocketFrame> {
    static List<String> lUsers = new ArrayList<>(); //存放所有参与匹配的OpenID
    static HashMap<ChannelHandlerContext, ChannelHandlerContext> mapCtx = new HashMap<>(); //索引为A方，字段为与A对战的B方
    static HashMap<ChannelHandlerContext, String> mapUserCtxReverse = new HashMap<>(); //索引为玩家进程，字段OpenID
    static HashMap<String, ChannelHandlerContext> mapUserCtx = new HashMap<>(); //索引为玩家进程，字段OpenID

//    @Override
//    public void channelActive(ChannelHandlerContext ctx) throws Exception {
//    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        String OpenID = mapUserCtxReverse.remove(ctx);
        if (OpenID != null){
            mapUserCtx.remove(OpenID);
            lUsers.remove(OpenID);
        }
        mapCtx.remove(ctx);
    }

    String getStrDate(){
        return new SimpleDateFormat("HH:mm:ss").format(new Date());
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, WebSocketFrame frame) throws Exception {
        if (frame instanceof TextWebSocketFrame) {
            // Send the uppercase string back.
            String request = ((TextWebSocketFrame) frame).text();
            // 心跳包
            if (request.equals("0")){
                ctx.channel().writeAndFlush(new TextWebSocketFrame("0"));
                return;
            }
            System.out.println(getStrDate()+ctx.channel().remoteAddress()+"\t"+request);
            int iColon = request.indexOf(":");
            if (iColon == -1) return;
            String cmd = request.substring(0, iColon);
            String OpenID = "", otherOpenID = "";
//            String sResponse = "200"; //请求成功
            ChannelHandlerContext oCtx = null;
            int i1 = request.indexOf("&", 1); //第一个"&"的位置；
            if (i1 != -1) OpenID = request.substring(iColon + 1, i1);
            switch (cmd) {
                case "wxLogin":
                    String userInfo = request.substring(i1 + 1);
                    Redis.getInstance().setUserInfo(OpenID, userInfo);
                    mapUserCtxReverse.put(ctx, OpenID);
                    mapUserCtx.put(OpenID, ctx);
                    break;
                case "match":
                    OpenID = request.substring(iColon + 1);
                    if (!lUsers.contains(OpenID)) return;
                    if (lUsers.size() > 0){
                        while(lUsers.size()>0){
                            otherOpenID = lUsers.remove(0);
//                            System.out.println(getStrDate()+"\t"+"me="+OpenID+"\t"+"other="+otherOpenID+"\t"+mapUserCtx.size());
                            oCtx = mapUserCtx.get(otherOpenID);
                            if (oCtx != null){
                                Redis redis = Redis.getInstance();
                                String other = redis.getUserInfo(otherOpenID);
                                if (other == null) other = "";
                                String me = redis.getUserInfo(OpenID);
                                if (me == null) me = "";
//                                System.out.println(getStrDate()+"\t"+"me="+me+"&"+OpenID+"\t"+"other="+other+"&"+otherOpenID);
                                ctx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":"+other));
                                oCtx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":"+me));
                                mapCtx.put(ctx, oCtx);
                                mapCtx.put(oCtx, ctx);
                                break;
                            }
                        }
                    }else lUsers.add(OpenID);
                    break;
                case "lose":
                    oCtx = mapCtx.get(ctx);
                    if (oCtx != null) {
                        oCtx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":"));
                        mapCtx.remove(oCtx);
                    }
                    mapCtx.remove(ctx);
                    break;
                case "quit":
                    OpenID = request.substring(iColon + 1);
                    lUsers.remove(OpenID);
                    break;
            }
        } else {
            String message = "unsupported frame type: " + frame.getClass().getName();
            throw new UnsupportedOperationException(message);
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
//        cause.printStackTrace();
        System.out.println(getStrDate()+ctx.channel().remoteAddress()+"\t"+cause);
        ctx.close();
    }
}