import task = require("../../tasking/Task");
import tq = require("../../tasking/TaskQueue");
import log = require("../../utils/Log");

import tsel = require("../redistask/SelectDBTask");
import tget = require("../redistask/GetTask");

export class SearchMsgTask extends task.Task {

    public keys: any;
    public msg: any;
    public result: string;
    public error: any;

    constructor(client: any, keys: any, msg: any) {
        super(client);
        this.keys = keys;
        this.msg = msg;
    }

    GetMessage(): string {
        if (typeof (this.msg) == "string") {
            return this.msg;
        }
        else if (this.msg == null) {
            return "";
        }
        else if (this.msg.hasOwnProperty("result")) {
            return this.msg.result;
        }
        else {
            return "";
        }
    }

    GetKeys(): Array<string> {
        if (this.keys.hasOwnProperty("result")) {
            return this.keys.result;
        }
        else {
            return this.keys;
        }
    }

    Execute() {
        super.Execute();
        var self = this;
        var keys = this.GetKeys();
        var msg = this.GetMessage();
        if (keys == null || keys.length == 0) {
            this.Done();
            return;
        }

        // 找到keys对应的msg并和msg进行对比
        var tasks: tq.TaskQueue = new tq.TaskQueue();
        tasks.AddTask(new tsel.SelectDBTask(this.data, tsel.SelectDBTask.DB_MESSAGE_MAP));
        var results: Array<tget.GetTask> = new Array<tget.GetTask>();
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            var tk = new tget.GetTask(this.data, key);
            tasks.AddTask(tk);
            results.push(tk);
        }
        tasks.once("complete", function () {
            for (var i = 0; i < results.length; ++i) {
                if (results[i].result == msg) {
                    log.debug("SearchMsgTask", "found msg exist: id=%s", results[i].GetKey());
                    self.error = "msg exists";
                    self.Abort();
                    return;
                }
            }
            self.result = null;
            self.Done();
        });
        tasks.once("abort", function () {
            log.debug("SearchMsgTask", "redis abort error:%s", tasks.CurrentTask()["error"]);
            self.Abort();
        });
        tasks.Execute();
    }
}