import req = require("../../base/Request");
import io = require("../../../utils/ByteArray");
import protoid = require("../ProtoID");
import util = require("../utils/Util");
import iterm = require("../../ITerminal");
import crypto = require("crypto");
import log = require("../../../utils/Log");

// 接收客户端发来的：
// 通信签名
// os
// os版本
// mac地址
export class ReqHandshake extends req.Request {
    sign: string;
    os: string;
    osver: string;
    udid: string;

    constructor() {
        super();
        this.sign = null;
        this.os = null;
        this.osver = null;
        this.udid = null;
    }

    Read(buffer: io.ByteArray): void {
        this.sign = util.ReadString(buffer);
        this.os = util.ReadString(buffer);
        this.osver = util.ReadString(buffer);
        this.udid = util.ReadString(buffer);
        console.log("sign: %s, os: %s, osver: %s", this.sign, this.os, this.osver);
    }

    Process(env: iterm.ITerminal): void {
        var key: number = env.handshakeKey;
        var plain: string = "020-37619030#" + key;
        var sign: string = crypto.createHash("md5").update(plain, "ascii").digest("hex");
        console.log(plain, sign);
        if (this.sign != sign) {
            // 签名不正确。踢人
            env.WithRequest(this.index).Bye("illegal client");
            log.fatal("ReqHandshake", "handshake error, addr:%s", env.GetConnection().remoteAddress);
        } else {
            // 签名正确，创建设备
            env.CreateDevice({ os: this.os, ver: this.osver, udid: this.udid });
        }
    }
}

// 注册协议号
export function init() {
    req.Request.RegisterType(protoid.ProtoID.HANDSHAKE, ReqHandshake);
}