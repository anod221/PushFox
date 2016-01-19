
// 检查协议的校验位是否合法
export function ProtoSum(len: number, index: number, proto: number): number {
    // b0 := len > 255
    // b1 := bit1Count(len&0xff) % 2
    // b2 := len > 65535
    // b3 := len > 0xffffff
    // b4 := index % 2
    // b5 := index == 0
    // b6 := bit1Count(proto) % 2
    // b7 := bit1Count( b0-b6 ) % 2

    var bit1_count = function (n): number {
        var c;
        for (c = 0; n != 0; ++c) {
            n &= (n - 1);
        }
        return c;
    }

    var ret: number = 0;
    if (len > 0xff) ret |= 0x01;
    ret |= (bit1_count(len & 0xff) & 0x01) << 1;
    if (len > 0xffff) ret |= 0x04;
    if (len > 0xffffff) ret |= 0x08;
    ret |= (index & 0x01) << 4;
    if (index == 0) ret |= 0x20;
    ret |= (bit1_count(proto) & 0x01) << 6;
    ret |= (bit1_count(ret) & 0x01) << 7;
    return ret;
}
