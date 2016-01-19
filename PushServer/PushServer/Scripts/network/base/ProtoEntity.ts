import io = require("../../utils/ByteArray")
import assert = require("assert");
import util = require("../proto/utils/Util");

function PushProtoParam(ba: io.ByteArray, type: string, val: any): void {
    if (type == "i8") {
        ba.writeByte(val);
    } else if (type == "u8") {
        ba.writeUnsignedByte(val);
    } else if (type == "i16") {
        ba.writeShort(val);
    } else if (type == "u16") {
        ba.writeUnsignedShort(val);
    } else if (type == "i32") {
        ba.writeInt(val);
    } else if (type == "u32") {
        ba.writeUnsignedInt(val);
    } else if (type == "utf8") {
        util.WriteString(ba, val);
    } else if (type == "f4") {
        ba.writeFloat(val);
    } else if (type == "f8") {
        ba.writeDouble(val);
    } else if (type.charAt(type.length - 1) == "s") {
        var len: number = val.length;
        ba.writeUnsignedShort(len);
        for (var i = 0; i < len; ++i) {
            PushProtoParam(ba, type.slice(0, -1), val[i]);
        }
    } else {
        assert(false, "got invalid type:" + type);
    }
}

export function PackProto(ba: io.ByteArray, ...arg): void {
    assert((arg.length % 2) == 0, "unmatched types");
    for (var i = 0; i < arg.length; i += 2) {
        PushProtoParam(ba, arg[i], arg[i + 1]);
    }
}

export class ProtoEntity {
    public id: number;

    GetBuffer(): io.ByteArray{
        // 子类来实现
        return null;
    }

}