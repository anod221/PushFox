import base = require("./base/RedisCmdTask");
import log = require("../../utils/Log");
import util = require("util");

export class DelTask extends base.RedisCmdTask {

    private key: string;
    private taskAsKey: base.RedisCmdTask;

    constructor(client: any, key: any) {
        super(client);
        if (key instanceof base.RedisCmdTask) {
            this.taskAsKey = key;
        }
        else {
            this.key = key;
        }
    }

    GetKey(): string {
        if (this.key == null) {
            return this.taskAsKey.result;
        }
        else {
            return this.key;
        }
    }

    Execute() {
        super.Execute();
        var self = this;

        var key = this.GetKey();
        if (key == null) {
            this.Done();
            return;
        }

        this.data.del(key, function (error, result) {
            if (error == null) {
                self.DoneWithResult(result, util.format("redis >del finish: key=%s", key));
            }
            else {
                self.AbortWithError(util.format("redis >del error: key=%s, error=%s", key, error));
            }
        });
    }
}