import net = require("net");
import event = require("events");

import mgr = require("./ConnectionMgr");
import iterm = require("./ITerminal");
import term = require("./Terminal");
import linker = require("./base/Messager");
import optor = require("./base/SocketOperator");

import device = require("../solution/controller/interf/IDevice");
import handshakepto = require("./proto/handshake/ProtoHandshake");
import byepto = require("./proto/error/ProtoBye");
import pushpto = require("./proto/push/ProtoPush");
import DeviceMgr = require("../solution/manager/DeviceMgr");

export class Terminal implements iterm.ITerminal {
    private static TAG: string = "Terminal";

    public id: number;                          // 终端id
    public handshakeKey: number;                // 连接

    private refConnMgr: mgr.ConnectionMgr;      // 管理器
    private refDevice: device.IDevice;          // 设备对象
    private messager: linker.Messager;          // 协议发送员
    private connOptor: optor.SocketOpeartor;    // socket事件检查
    private commReqIndex: number;               // 响应码
    private isAuthorized: boolean;              // 是否认证

    // 构造函数
    constructor(id: number, mgr: mgr.ConnectionMgr, conn: net.Socket) {
        this.id = id;
        this.refConnMgr = mgr;
        this.messager = new linker.Messager(conn);
        this.connOptor = new optor.SocketOpeartor(conn, this);
        this.handshakeKey = Math.floor(Math.random() * 0x7fffffff);
        this.isAuthorized = false;
        this.commReqIndex = 0;
    }

    IsAuthorized(): boolean {
        return this.isAuthorized;
    }

    CreateDevice(info: Object): void {
        var device = DeviceMgr.NewDevice(this, info);
        this.refDevice = device;
    }

    GetDevice(): device.IDevice {
        return this.refDevice;
    }

    GetConnection(): net.Socket {
        return this.connOptor.refConnection;
    }

    WithRequest(index: number): iterm.ITerminal {
        this.commReqIndex = index;
        return this;
    }

    Handshake() {
        this.messager.Send(new handshakepto.ProtoHandshake(this.handshakeKey), this.commReqIndex);
        this.commReqIndex = 0;
    }

    Bye(msg: string) {
        var self = this;
        this.messager.Send(new byepto.ProtoBye(msg), this.commReqIndex, function () { self.Disconnect(); });
        this.commReqIndex = 0;
    }

    Push(msgs: Array<string>) {
        this.messager.Send(new pushpto.ProtoPush(msgs), this.commReqIndex);
        this.commReqIndex = 0;
    }

    Disconnect() {
        this.messager.refConnection.end();
    }

    Destroy() {
        if (this.refDevice != null) {
            DeviceMgr.KillDevice(this.refDevice);
        }
        var mgr = this.refConnMgr;
        var id = this.id;
        setImmediate(function () { mgr.RemoveTerminal(id) });
    }
}
