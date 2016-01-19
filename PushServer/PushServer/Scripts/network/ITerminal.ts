import net = require("net");
import event = require("events");
import device = require("../solution/controller/interf/IDevice");

export interface ITerminal {
    // 公开成员，一般为read-only
    id: number;
    handshakeKey: number;

    // 设备接口
    IsAuthorized(): boolean;
    CreateDevice(info: Object): void;
    GetDevice(): device.IDevice;

    // 获取socket
    GetConnection(): net.Socket;

    // 响应协议号设置
    WithRequest(index: number): ITerminal;

    // 客户端协议处理
    Handshake(): void;
    Bye(msg: string): void;
    Push(msgs: Array<string>): void;
    Disconnect(): void;
    Destroy(): void;
}
