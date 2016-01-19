var redis = require("redis");

import assert = require("assert");

import base = require("./IDataAccessor");
import device = require("../controller/interf/IDevice");
import user = require("../controller/interf/IUser");
import task = require("../tasking/Task");
import taskq = require("../tasking/TaskQueue");

import tsel = require("./redistask/SelectDBTask");
import tsmem = require("./redistask/SMemberTask");
import tpush = require("../controller/task/PushTask");
import tclrmsg = require("../controller/task/ClearMsgTask");

export class RedisAccess implements base.IDataAccess {
    public client: any;                 //redisClient

    constructor() {
        this.client = redis.createClient({
            host: "localhost",
            port: 6379
        });

        this.client.on("error", function (err) {
            console.error("redis error:%s", err);
        });
    }

    PushByDevice(dev: device.IDevice, processor: Function): void {
        assert(processor != null, "invalid callback");

        var tasks = new taskq.TaskQueue();
        // 第一步：选中pending message所在的db
        var selecttask = new tsel.SelectDBTask(this.client, tsel.SelectDBTask.DB_PENDING_MAP);
        tasks.AddTask(selecttask);
        // 第二步：读取pending message的数据
        var readtask = new tsmem.SMemberTask(this.client, dev.GetDeviceUniqueID());
        tasks.AddTask(readtask);
        // 第三步：发送协议
        var sendtask = new tpush.PushTask(this.client, readtask, dev);
        tasks.AddTask(readtask);

        processor( tasks );
    }

    SetPushProcessor(dev: device.IDevice, processor: Function): void {
        assert(dev != null, "无法订阅空设备信息");
        if (process) {
            // 添加监听
            this.client.subscribe(dev.GetDeviceUniqueID(), function (error, message) {
                if (!error) {
                    processor(message);
                }
                else {
                    console.error(error);
                }
            });
        }
        else {
            // 移除监听
            this.client.unsubscribe(dev.GetDeviceUniqueID());
        }
    }

    ClearPush(dev: device.IDevice, msgs: Array<string>, callback: Function ): void {
        var clrmsg = new tclrmsg.ClearMsgTask(this.client, dev, msgs);
        clrmsg.once("complete", callback);
        clrmsg.Execute();
    }
}
