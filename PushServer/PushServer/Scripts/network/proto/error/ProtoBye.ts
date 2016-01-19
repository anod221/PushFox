import entity = require("../../base/ProtoEntity");
import io = require("../../../utils/ByteArray");
import util = require("../utils/Util");
import protoid = require("../ProtoID");

// 握手协议
// 服务器发送一个数字到客户端，客户端
// 把这个数字进行签名，并提交客户端当前
// 设备信息：os，os版本，mac地址回来
export class ProtoBye extends entity.ProtoEntity {
    private message: string;
    constructor(msg: string) {
        super();
        this.id = protoid.ProtoID.RESPONSE | protoid.ProtoID.BYE;
        this.message = msg;
    }

    GetBuffer(): io.ByteArray {
        var len = Buffer.byteLength(this.message, "utf8");
        var buf = new io.ByteArray(len);
        entity.PackProto(buf, "utf8", this.message);
        return buf;
    }
}