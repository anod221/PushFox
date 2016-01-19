import entity = require("../../base/ProtoEntity");
import io = require("../../../utils/ByteArray");
import protoid = require("../ProtoID");
import util = require("../utils/Util");

// 握手协议
// 服务器发送一个数字到客户端，客户端
// 把这个数字进行签名，并提交客户端当前
// 设备信息：os，os版本，mac地址回来
export class ProtoPush extends entity.ProtoEntity {
    private data: Array<string>;
    constructor(msgs: Array<string>) {
        super();
        this.id = protoid.ProtoID.RESPONSE | protoid.ProtoID.PUSH;
        this.data = msgs;
    }

    GetBuffer(): io.ByteArray {
        var buf = new io.ByteArray(this.data.length * 400);
        entity.PackProto(buf, "utf8s", this.data);
        return buf;
    }
}
