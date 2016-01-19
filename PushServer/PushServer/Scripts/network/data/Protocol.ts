import assert = require("assert");
import entity = require("../base/ProtoEntity");
import io = require("../../utils/ByteArray");
import util = require("./utils/Util");

export class Protocol {
    public static LENGTH_MASK = 0x7fffffff;

    public length: number;              // 协议体长度，写入最前方，uint32
    public index: number;               // 请求编号，用来识别响应的请求是哪个，uint16
    public id: number;                  // 协议号，uint16
    public body: io.ByteArray;          // 协议体

    static common_buffer: io.ByteArray = new io.ByteArray(4096);

    constructor(body: entity.ProtoEntity, index: number) {
        assert(body != null, "非法参数body");

        var buf = body.GetBuffer();

        var len = buf.length + 8;
        assert(len <= 0xffff, "协议体超长");

        this.index = index;
        this.id = body.id;
        this.body = buf;
        this.length = len;
    }

    public GetBinary(): io.ByteArray {
        var buf = Protocol.common_buffer;
        buf.clear();
        buf.writeUnsignedByte(util.ProtoSum(this.length, this.index, this.id));
        buf.writeUnsignedByte(this.index);
        buf.writeUnsignedInt(this.length ^ Protocol.LENGTH_MASK);
        buf.writeUnsignedShort(this.id);
        if (this.body != null) {
            buf.writeBytes(this.body);
        }
        return buf;
    }
}