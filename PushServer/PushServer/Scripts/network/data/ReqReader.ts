import net = require("net");
import assert = require("assert");
import req = require("../base/Request");
import io = require("../../utils/ByteArray")
import util = require("./utils/Util");
import pto = require("./Protocol");
import phexc = require("../exception/ProtoHeaderException");

// req列表
import req1 = require("../proto/handshake/ReqHandshake");
import req2 = require("../proto/heartbeat/ReqHeartBeat");
import req3 = require("../proto/push/ReqPush");

var reqinit: boolean = false;
function RegisterAllReg() {
    if (!reqinit) {
        req1.init();
        req2.init();
        req3.init();

        reqinit = true;
    }
}

export class ReqReader {
    static HEADER_SIZE: number = 8;

    public buffer: io.ByteArray;
    private gindex: number;                        // 客户端协议序号

    constructor() {
        this.gindex = 0;

        RegisterAllReg();
    }

    Read(buf: io.ByteArray ): req.Request {
        if (this.buffer == null) {
            // 从0开始读
            if (buf.bytesAvailable < ReqReader.HEADER_SIZE) {
                // 读不了
                this.CutPackage(buf);
                return null;
            }
            else {
                var checksum: number = buf.readUnsignedByte();
                var index: number = buf.readUnsignedByte();
                var len: number = buf.readUnsignedInt() ^ pto.Protocol.LENGTH_MASK;
                var id: number = buf.readUnsignedShort();

                // 协议头检查，防止恶意包体攻击
                if (util.ProtoSum(len, index, id) != checksum) {
                    throw new phexc.ProtoHeaderException();
                }

                if (buf.bytesAvailable + ReqReader.HEADER_SIZE < len) {
                    // 读不了
                    this.CutPackage(buf);
                    return null;
                }
                else {
                    // 读出协议
                    buf.position -= ReqReader.HEADER_SIZE;
                    var request: req.Request = req.Request.CreateFromBuffer(buf);
                    this.gindex = request.index;
                    return request;
                }
            }
        }
        else {
            // 拼接原来包
            buf.readBytes(this.buffer, this.buffer.length, buf.bytesAvailable);
            this.buffer.position = 0;
            
            // 清理现场
            var buffer = this.buffer;
            this.buffer = null;
            return this.Read(buffer);
        }
    }

    private CutPackage(buffer: io.ByteArray): void {
        if (buffer.bytesAvailable > 0) {
            var buf = new io.ByteArray(buffer.bytesAvailable);
            buffer.readBytes(buf);
            this.buffer = buf;
        }
    }
}