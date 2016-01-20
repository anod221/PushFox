var redis = require("redis");

import assert = require("assert");

import base = require("./IDataAccessor");
import device = require("../controller/interf/IDevice");
import user = require("../controller/interf/IUser");
import task = require("../tasking/Task");
import taskq = require("../tasking/TaskQueue");

import tsel = require("./redistask/SelectDBTask");
import tsmem = require("./redistask/SMembersTask");
import tsub = require("./redistask/SubscribeTask");
import tpush = require("../controller/task/PushTask");
import tclrmsg = require("../controller/task/ClearMsgTask");
import log = require("../../utils/Log");

export class RedisAccess implements base.IDataAccess {

    private static TAG = "RedisAccess";

    private client: any;                 //redisClient
    private channel: any;                //redisClient for subscribe

    constructor() {
        this.client = redis.createClient({
            host: "localhost",
            port: 6379
        });

        this.client.on("error", function (err) {
            log.error(RedisAccess.TAG, "redis error:%s", err);
        });

        this.channel = redis.createClient({
            host: "localhost",
            port: 6379
        });
        this.channel.on("error", function (err) {
            log.error(RedisAccess.TAG, "redis chat error:%s", err);
        });
    }

    PushByDevice(dev: device.IDevice, processor: Function): void {
        assert(processor != null, "invalid callback");

        var tasks = new taskq.TaskQueue();
        // 第一步：选中pending message所在的db
        var selecttask = new tsel.SelectDBTask(this.client, tsel.SelectDBTask.DB_PENDING_MAP);
        tasks.AddTask(selecttask);
        // 第二步：读取pending message的数据
        var readtask = new tsmem.SMembersTask(this.client, dev.GetDeviceUniqueID());
        tasks.AddTask(readtask);
        // 第三步：发送协议
        var sendtask = new tpush.PushTask(this.client, readtask, dev);
        tasks.AddTask(sendtask);

        processor( tasks );
    }

    SetPushProcessor(dev: device.IDevice, processor: Function): void {
        assert(dev != null, "无法订阅空设备信息");
        if (processor) {
            // 添加监听
            var self = this;
            var subscb = new tsub.SubscribeTask(this.channel, dev.GetDeviceUniqueID(), processor);
            subscb.Execute();
        }
        else {
            // 移除监听
            this.channel.unsubscribe(dev.GetDeviceUniqueID());
        }
    }

    ClearPush(dev: device.IDevice, msgs: Array<string>, callback: Function ): void {
        var clrmsg = new tclrmsg.ClearMsgTask(this.client, dev, msgs);
        clrmsg.once("complete", callback);
        clrmsg.Execute();
    }
}
