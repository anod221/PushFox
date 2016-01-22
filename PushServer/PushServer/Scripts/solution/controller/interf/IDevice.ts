import event = require("events");

import iterm = require("../../../network/ITerminal");

// IDevice: 描述一个客户端连接上对应的设备
//          一个设备可以同时挂载多个用户User，可以通过后台对每个User发送信息
//          设备保存在Terminal对象中，每一个认证过的Terminal都有唯一的IDevice实例
//
// 当设备的服务连接到推送服务器后，设备把其唯一编码
// 发送到推送服务器，完成设备登入流程。
//
export interface IDevice {
    // 是否可用
    IsActive(): boolean;

    // 设备唯一编号
    GetDeviceUniqueID(): string;

    // 取得设备的网络终端对象
    GetTerminal(): iterm.ITerminal;

    // 获取事件派发器
    GetEventEmitter(): event.EventEmitter;

    // 获取设备参数
    GetDeviceParameter(key: string): any;

    // 生命周期相关
    Start(): void;
    Destroy(): void;
}