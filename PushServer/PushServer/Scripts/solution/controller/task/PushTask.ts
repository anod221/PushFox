import task = require("../../tasking/Task");
import taskq = require("../../tasking/TaskQueue");
import device = require("../../controller/interf/IDevice");

import tsel = require("../../database/redistask/SelectDBTask");
import tget = require("../../database/redistask/GetTask");

/**
 * 推送任务：
 * 向设备 dev 发送 msgids 对应的消息。
 * 首先读取msgids的真实内容，再发送到dev上。并且等待
 * dev回复协议后才完成任务
 */
export class PushTask extends task.Task {

    private refSMemberTask: any;
    private dev: device.IDevice;

    constructor(client: any, source:any, dev: device.IDevice) {
        super(client);
        this.refSMemberTask = source;
        this.dev = dev;
    }

    Execute() {
        super.Execute();
        var msgs: Array<string> = this.refSMemberTask.result;
        if (msgs.length == 0) {
            this.Done();
            return;
        }


        var tasks = new taskq.TaskQueue();
        var self = this;
        var client = this.data;
        var messages: Array<tget.GetTask> = new Array<tget.GetTask>();

        var selecttask = new tsel.SelectDBTask(client, tsel.SelectDBTask.DB_MESSAGE_MAP);
        tasks.AddTask(selecttask);
        for (var i = 0; i < msgs.length; ++i) {
            var gettask = new tget.GetTask(client, msgs[i]);
            tasks.AddTask(gettask);
            messages.push(gettask);
        }
        tasks.once("complete", function () {
            var m: Array<string> = new Array<string>();
            for (var i = 0; i < messages.length; ++i) {
                m.push(messages[i].result+"&index="+messages[i].GetKey());
            }
            self.Push( m );
        });
        tasks.once("abort", function () {
            self.Done();
        });
        tasks.Execute();
    }

    Push(msgs: Array<string>) {
        var self = this;
        this.dev.GetTerminal().Push(msgs);
        // 注意：
        // 推送协议发送到设备后，设备会回应一个协议通知
        // 推送服务器推送完成。此时在协议的Process中会
        // 新建一个TaskQueue把完成的消息删除掉，删除完
        // 成后才会发送pushOK事件
        this.dev.GetEventEmitter().once("pushOK", function () {
            self.Done();
        });
    }
}