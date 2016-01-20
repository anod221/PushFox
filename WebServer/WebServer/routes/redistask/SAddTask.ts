import base = require("./base/RedisCmdTask");
import log = require("../../utils/Log");
import util = require("util");

export class SAddTask extends base.RedisCmdTask {

    private key: string;
    private taskAsKey: base.RedisCmdTask;
    private value: Array<string>;
    private taskAsValue: base.RedisCmdTask;

    constructor(client: any, key: any, val: any) {
        super(client);
        if (key instanceof base.RedisCmdTask) {
            this.taskAsKey = key;
        }
        else {
            this.key = key;
        }
        if (val instanceof base.RedisCmdTask) {
            this.taskAsValue = val;
        }
        else {
            this.value = val;
        }
    }

    GetKey(): string {
        if (this.key == null) {
            return this.taskAsKey.result;
        } else {
            return this.key;
        }
    }

    GetValues(): Array<string> {
        if (this.value != null) {
            return this.value;
        }
        else if (typeof (this.taskAsKey.result) == "string") {
            return [this.taskAsValue.result];
        }
        else {
            return this.taskAsValue.result;
        }
    }

    Execute() {
        super.Execute();
        var self = this;
        var key = this.GetKey();
        var val = this.GetValues();

        if (key == null || val == null || val.length == 0) {
            this.Done();
            return;
        }

        this.data.sadd(key, val, function (error, result) {
            if (error == null) {
                self.DoneWithResult(result, util.format("redis >sadd finish: key=%s val=%s", key, val));
            }
            else {
                self.AbortWithError(util.format("redis >sadd error: key=%s val=%s error=%s", key, val, error));
            }
        });
    }
}