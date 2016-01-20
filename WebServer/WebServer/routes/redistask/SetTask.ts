import base = require("./base/RedisCmdTask");
import log = require("../../utils/Log");
import util = require("util");

export class SetTask extends base.RedisCmdTask {

    private key: string;
    private taskAsKey: base.RedisCmdTask;
    private value: string;
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

    GetValue(): string {
        if (this.value == null) {
            return this.taskAsValue.result;
        } else {
            return this.value;
        }
    }

    Execute() {
        super.Execute();
        var self = this;

        var key = this.GetKey();
        var value = this.GetValue();
        if (key == null || value == null) {
            this.Done();
            return;
        }

        this.data.set(key, value, function (error, result) {
            if (error == null) {
                self.DoneWithResult(result, util.format("redis >set finish: key=%s val=%s res=%s", key, value, result));
            }
            else {
                self.AbortWithError(util.format("redis >set error: key=%s val=%s error=%s", key, value, error));
            }
        });
    }
}