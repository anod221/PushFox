import task = require("../../tasking/Task");
import taskq = require("../../tasking/TaskQueue");
import device = require("../../controller/interf/IDevice");

import access = require("../../database/IDataAccessor");
import tsel = require("../../database/redistask/SelectDBTask");
import tget = require("../../database/redistask/GetTask");

/**
 * 推送任务：
 * 向设备 dev 发送 msgids 对应的消息。
 * 首先读取msgids的真实内容，再发送到dev上。并且等待
 * dev回复协议后才完成任务
 */
export class ClearMsgTask extends task.Task {

    private msgids: Array<string>;
    private dev: device.IDevice;

    constructor( client: any, dev: device.IDevice, ids:Array<string>) {
        super( client );
        this.msgids = ids;
        this.dev = dev;
    }

    Execute() {
        super.Execute();
        var tasks = new taskq.TaskQueue();
        var self = this;
        var client = this.data;
        var targets = this.msgids.slice();
        targets.unshift(this.dev.GetDeviceUniqueID());
        client.multi()
            .select(tsel.SelectDBTask.DB_PENDING_MAP)
            .srem(targets)
            .select(tsel.SelectDBTask.DB_MESSAGE_MAP)
            .del(this.msgids)
            .execAsync()
            .then(function () {
                self.Done();
            });
    }
}