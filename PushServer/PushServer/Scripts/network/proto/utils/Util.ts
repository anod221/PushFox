import assert = require("assert");
import io = require("../../../utils/ByteArray");
export function ReadString(ba: io.ByteArray): string {
    var len = ba.readUnsignedShort();
    return ba.readMultiBytes(len);
}
export function WriteString(ba: io.ByteArray, str: string): void {
    var len = Buffer.byteLength(str, "utf8");
    assert( len <= 0xffff, "the string is too long" );
    ba.writeUnsignedShort(len);
    ba.writeMultiBytes(str);
}