import device = require("../controller/interf/IDevice");
import impl = require("./RedisAccess");

export interface IDataAccess {
    // 生成某个device上的所有待推送任务，并回调到processor中
    PushByDevice(dev: device.IDevice, processor: Function): void;

    // 设置有推送任务的回调
    SetPushProcessor(dev: device.IDevice, processor: Function): void;

    // 清除数据
    ClearPush(dev: device.IDevice, msgids: Array<string>, callback: Function): void;
}

var inst: IDataAccess;
export function Instance(): IDataAccess {
    if (inst == null) {
        inst = new impl.RedisAccess();
    }
    return inst;
}