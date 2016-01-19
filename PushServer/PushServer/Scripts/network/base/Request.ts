import assert = require("assert");
import util = require("util");
import io = require("../../utils/ByteArray")
import iterm = require("../ITerminal");
import prexc = require("../exception/ProtoReadException");
import log = require("../../utils/Log");
import pto = require("../data/Protocol");

export class Request {
    private static TAG: string = "Request";
    public index: number;                   // 协议标识
    public id: number;                      // 协议类型
    public len: number;                     // 协议长度

    Process( env: iterm.ITerminal ): void {
        log.info( Request.TAG, "process protocol: id=%d", this.id );
    }

    public Read(buf: io.ByteArray): void {
        
    }

    static CreateFromBuffer(buffer: io.ByteArray): Request {
        var start = buffer.position;
        buffer.position = start + 2;
        var len = buffer.readUnsignedInt() ^ pto.Protocol.LENGTH_MASK;
        buffer.position = start + 6;
        var id = buffer.readUnsignedShort();
        var retval = Request.CreateEmptyRequest(id);
        retval.Read(buffer);
        if( buffer.position != start + len ) {
            throw new prexc.ProtoReadException();
        }
        log.info(Request.TAG, "read protocol ok: id=%d", id);
        return retval;
    }

    private static type_map: Object = {};
    static RegisterType(id: number, Class: any): void {
        assert(Request.type_map[id] == undefined, util.format("proto conflict:%d", id) );
        Request.type_map[id] = Class;
    }
    private static CreateEmptyRequest(id: number): Request {
        assert(Request.type_map[id] != undefined, util.format("proto not found: %d", id) );
        return new Request.type_map[id];
    }
}