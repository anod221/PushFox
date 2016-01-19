import entity = require("../../base/ProtoEntity");
import io = require("../../../utils/ByteArray");
import protoid = require("../ProtoID");

// 握手协议
// 服务器发送一个数字到客户端，客户端
// 把这个数字进行签名，并提交客户端当前
// 设备信息：os，os版本，mac地址回来
export class ProtoHandshake extends entity.ProtoEntity {
    private key: number;
    constructor( key: number ) {
        super();
        this.id = protoid.ProtoID.RESPONSE | protoid.ProtoID.HANDSHAKE;
        this.key = key;
        console.log("connection key:%d", key);
    }

    GetBuffer(): io.ByteArray {
        var buf = new io.ByteArray(4);
        entity.PackProto(buf, "i32", this.key);
        return buf;
    }
}
