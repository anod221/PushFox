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
export class ReqHeartBeat extends req.Request {
    constructor() {
        super();
    }

    Read(buffer: io.ByteArray): void {
        // todo
    }

    Process(env: iterm.ITerminal): void {
        // todo
    }
}

// 注册协议号
export function init() {
    req.Request.RegisterType(protoid.ProtoID.HEARTBEAT, ReqHeartBeat);
}