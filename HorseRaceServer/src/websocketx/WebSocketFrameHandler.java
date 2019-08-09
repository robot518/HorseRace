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

import java.net.SocketAddress;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

/**
 * Echoes uppercase content of text frames.
 */
public class WebSocketFrameHandler extends SimpleChannelInboundHandler<WebSocketFrame> {
    private static long iCount = 0;
    static List<ChannelHandlerContext> lCtx = new ArrayList<>(); //存放所有参与匹配的进程
    static HashMap<ChannelHandlerContext, ChannelHandlerContext> mapCtx = new HashMap<>(); //索引为A方，字段为与A对战的B方
    static HashMap<ChannelHandlerContext, String> mapUserInfo = new HashMap<>(); //索引为玩家进程，字段为玩家信息
//    long startTime = -1;

    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        iCount++;
//        if (startTime < 0) {
//            startTime = System.currentTimeMillis();
//        }
//        String sDate = new SimpleDateFormat("MMdd").format(new Date());
//        SocketAddress addr = ctx.channel().remoteAddress();
//        Redis.getInstance().setRecord(sDate, getStrAddress(addr), -1);
//        System.out.println("channelActive:"+getStrDate()+ctx.channel().remoteAddress()+"\t"+addr);
    }

    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        iCount--;
        mapUserInfo.remove(ctx);
        lCtx.remove(ctx);
        mapCtx.remove(ctx);
//        Long iDate = (System.currentTimeMillis() - startTime) / 1000;
//        String sDate = new SimpleDateFormat("MMdd").format(new Date());
//        SocketAddress addr = ctx.channel().remoteAddress();
//        Redis.getInstance().setRecord(sDate, getStrAddress(addr), iDate);
//        System.out.println("channelInactive:"+getStrDate()+ctx.channel().remoteAddress()+"\t"+addr);
    }

    String getStrAddress(SocketAddress addr){
        String sAddress = addr.toString();
        return sAddress.substring(1, sAddress.indexOf(":"));
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
//            String sName = "";
//            String sResponse = "200"; //请求成功
            ChannelHandlerContext oCtx = null;
//            int i1 = request.indexOf("|", 1); //第一个"|"的位置；
//            if (i1 != -1)
//                sName = request.substring(iColon + 1, i1);
            switch (cmd) {
                case "wxLogin":
//                    String nickName = request.substring(iColon + 1, i1);
//                    String avatarUrl = request.substring(i1+1);
                    String userInfo = request.substring(iColon + 1);
                    mapUserInfo.put(ctx, userInfo);
                    break;
                case "match":
//                    String OpenID = request.substring(iColon + 1);
                    if (lCtx.size() > 0){
                        oCtx = lCtx.remove(0);
                        String other = mapUserInfo.get(oCtx);
                        if (other == null) other = "";
                        String me = mapUserInfo.get(ctx);
                        if (me == null) me = "";
                        ctx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":"+other));
                        oCtx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":"+me));
                        mapCtx.put(ctx, oCtx);
                        mapCtx.put(oCtx, ctx);
                    }else lCtx.add(ctx);
                    break;
                case "jump":
                    oCtx = mapCtx.get(ctx);
                    if (oCtx != null) oCtx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":"));
                    break;
                case "lose":
                    oCtx = mapCtx.get(ctx);
                    if (oCtx != null) {
                        oCtx.channel().writeAndFlush(new TextWebSocketFrame(cmd + ":"));
                        mapCtx.remove(oCtx);
                    }
                    mapCtx.remove(ctx);
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