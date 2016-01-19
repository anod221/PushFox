import idev = require("../controller/interf/IDevice");
import dev = require("../controller/Device");
import access = require("../database/IDataAccessor");
import iterm = require("../../network/ITerminal");
import log = require("../../utils/Log");

var deviceMap = {};             //key: udid  value: IDevice
var TAG = "DeviceMgr";

export function NewDevice(terminal: iterm.ITerminal, info: Object): idev.IDevice {
    // 1 创建device示例
    var device: idev.IDevice = new dev.Device( terminal, info );
    // 2 加入到访问列表
    deviceMap[device.GetDeviceUniqueID()] = device;
    // 3 收听设备消息
    device.Start();

    log.info( TAG, "create device: terminal=%d udid=%s", terminal.id, device.GetDeviceUniqueID() );
    return device;
}

export function KillDevice(device: idev.IDevice): void {
    device.GetEventEmitter().emit("exit", device);
    device.Destroy();
    log.info(TAG, "free device: udid=%s", device.GetDeviceUniqueID());
    delete deviceMap[ device.GetDeviceUniqueID() ];
}

export function SearchDevice(udid: string): idev.IDevice {
    return deviceMap[udid];
}
