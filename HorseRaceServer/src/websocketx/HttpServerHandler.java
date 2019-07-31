package websocketx;

import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.*;
import sun.security.ssl.Debug;

import static io.netty.handler.codec.http.HttpHeaderNames.CONNECTION;
import static io.netty.handler.codec.http.HttpHeaderNames.CONTENT_LENGTH;
import static io.netty.handler.codec.http.HttpHeaderNames.CONTENT_TYPE;
import static io.netty.handler.codec.http.HttpHeaderValues.CLOSE;
import static io.netty.handler.codec.http.HttpHeaderValues.KEEP_ALIVE;
import static io.netty.handler.codec.http.HttpHeaderValues.TEXT_PLAIN;
import static io.netty.handler.codec.http.HttpResponseStatus.OK;

public class HttpServerHandler extends SimpleChannelInboundHandler<HttpObject> {
    private static final byte[] CONTENT = { 'H', 'e', 'l', 'l', 'o', ' ', 'W', 'o', 'r', 'l', 'd' };

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) {
        ctx.flush();
    }

    @Override
    public void channelRead0(ChannelHandlerContext ctx, HttpObject msg) {
        if (msg instanceof HttpRequest) {
            HttpRequest req = (HttpRequest) msg;
            Debug.println("req = ", req.toString());
            String uri = req.uri();
            int idx = uri.indexOf("code=");
            if (idx != -1) {
                String code = uri.substring(idx+5);
                WebSocketServer.sendRequest(code);
            }

//            boolean keepAlive = HttpUtil.isKeepAlive(req);
//            FullHttpResponse response = new DefaultFullHttpResponse(req.protocolVersion(), OK,
//                    Unpooled.wrappedBuffer(CONTENT));
//            response.headers()
//                    .set(CONTENT_TYPE, TEXT_PLAIN)
//                    .setInt(CONTENT_LENGTH, response.content().readableBytes());
//
//            if (keepAlive) {
//                if (!req.protocolVersion().isKeepAliveDefault()) {
//                    response.headers().set(CONNECTION, KEEP_ALIVE);
//                }
//            } else {
//                // Tell the client we're going to close the connection.
//                response.headers().set(CONNECTION, CLOSE);
//            }
//
//            ChannelFuture f = ctx.write(response);
//
//            if (!keepAlive) {
//                f.addListener(ChannelFutureListener.CLOSE);
//            }
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}