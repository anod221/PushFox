import req = require("../../base/Request");
import io = require("../../../utils/ByteArray");
import protoid = require("../ProtoID");
import util = require("../utils/Util");
import iterm = require("../../ITerminal");
import crypto = require("crypto");
import access = require("../../../solution/database/IDataAccessor");

// 接收客户端发来的：
// 通信签名
// os
// os版本
// mac地址
export class ReqPush extends req.Request {
    private msgids: Array<string>;

    constructor() {
        super();
        this.msgids = new Array<string>();
    }

    Read(buffer: io.ByteArray): void {
        var size = buffer.readUnsignedShort();
        for (var i = 0; i < size; ++i) {
            var len = buffer.readUnsignedShort();
            var id = buffer.readMultiBytes(len);
            this.msgids.push(id);
        }
    }

    Process(env: iterm.ITerminal): void {
        access.Instance().ClearPush(env.GetDevice(), this.msgids, function () {
            env.GetDevice().GetEventEmitter().emit("pushOK", env.GetDevice());
        });
    }
}

// 注册协议号
export function init() {
    req.Request.RegisterType(protoid.ProtoID.PUSH, ReqPush);
}