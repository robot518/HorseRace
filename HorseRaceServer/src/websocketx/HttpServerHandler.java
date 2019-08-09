package websocketx;

import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.*;
import io.netty.util.CharsetUtil;
import sun.security.ssl.Debug;

import static io.netty.handler.codec.http.HttpResponseStatus.OK;
import static io.netty.handler.codec.http.HttpVersion.HTTP_1_1;
import static io.netty.handler.codec.rtsp.RtspResponseStatuses.BAD_REQUEST;

public class HttpServerHandler extends SimpleChannelInboundHandler<HttpObject> {

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) {
        ctx.flush();
    }

    @Override
    public void channelRead0(ChannelHandlerContext ctx, HttpObject msg) {
        if (msg instanceof HttpRequest) {
            HttpRequest req = (HttpRequest) msg;
//            Debug.println("req = ", req.toString());
            String uri = req.uri();
            int idx = uri.indexOf("code=");
            if (idx != -1) {
                String code = uri.substring(idx+5);
                String url = "https://api.weixin.qq.com/sns/jscode2session?appid=wxfbc58b2a422781e5&secret=e398010913c4c60568e4c91cff448fe8&js_code=" + code + "&grant_type=authorization_code";
                String data = HttpUtils.get(url);
                String s1 = "session_key", s2 = "openid";
                int iSession_key = data.indexOf(s1);
                if (iSession_key == -1) return;
                int iOpenid = data.indexOf(s2);
                String openid = data.substring(iOpenid+s2.length()+3, data.length()-2);
//                String usrId = data.substring(iSession_key+s1.length()+3, iSession_key+s1.length()+8)+openid.substring(0, 5);
//                Debug.println(openid, usrId);

                boolean keepAlive = HttpUtil.isKeepAlive(req);
                FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1, msg.decoderResult().isSuccess()? OK : BAD_REQUEST,
                        Unpooled.copiedBuffer(openid, CharsetUtil.UTF_8));
                response.headers().set(HttpHeaderNames.CONTENT_TYPE, "text/plain; charset=UTF-8");

                if (keepAlive) {
                    // Add 'Content-Length' header only for a keep-alive connection.
                    response.headers().setInt(HttpHeaderNames.CONTENT_LENGTH, response.content().readableBytes());
                    // Add keep alive header as per:
                    // - http://www.w3.org/Protocols/HTTP/1.1/draft-ietf-http-v11-spec-01.html#Connection
                    response.headers().set(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
                }

                ChannelFuture f = ctx.write(response);

                if (!keepAlive) {
                    f.addListener(ChannelFutureListener.CLOSE);
                }
            }
        }
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}