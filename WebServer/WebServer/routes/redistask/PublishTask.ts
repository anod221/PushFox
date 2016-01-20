import base = require("./base/RedisCmdTask");
import log = require("../../utils/Log");
import util = require("util");

export class PublishTask extends base.RedisCmdTask {

    private channel: string;
    private taskAsChan: base.RedisCmdTask;
    private message: string;
    private taskAsMsg: base.RedisCmdTask;

    constructor(client: any, channel: any, message: any) {
        super(client);
        if (channel instanceof base.RedisCmdTask) {
            this.taskAsChan = channel;
        }
        else {
            this.channel = channel;
        }
        if (message instanceof base.RedisCmdTask) {
            this.taskAsMsg = message;
        }
        else {
            this.message = message;
        }
    }

    GetChannel(): string {
        if (this.channel == null) {
            return this.taskAsChan.result;
        } else {
            return this.channel;
        }
    }

    GetMessage(): string {
        if (this.message == null) {
            return this.taskAsMsg.result;
        } else {
            return this.message;
        }
    }

    Execute() {
        super.Execute();
        var self = this;

        var key = this.GetChannel();
        var msg = this.GetMessage();
        if (key == null) {
            this.Done();
            return;
        }

        this.data.publish(key, msg, function (error, result) {
            if (error == null) {
                self.DoneWithResult(result, util.format("redis >publish finish: chan=%s msg=%s", key, msg));
            }
            else {
                self.AbortWithError(util.format("redis >publish error: can=%s msg=%s err=%s", key, msg, error));
            }
        });
    }
}