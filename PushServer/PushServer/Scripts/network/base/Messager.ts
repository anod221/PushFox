
import net = require("net")
import entity = require("./ProtoEntity");
import protocol = require("../data/Protocol");
import log = require("../../utils/Log");

export class Messager {
    private static TAG: string = "Messager";

    refConnection: net.Socket;

    constructor(conn: net.Socket) {
        this.refConnection = conn;
    }

    Send(data: entity.ProtoEntity, index: number, callback: Function=null) {
        var conn = this.refConnection;
        var msg = new protocol.Protocol(data, index);
        if (callback == null) {
            conn.write(msg.GetBinary().ToBuffer());
        } else {
            conn.write(msg.GetBinary().ToBuffer(), callback);
        }
        log.info(Messager.TAG, "send proto: id=%d", msg.id);
    }
}