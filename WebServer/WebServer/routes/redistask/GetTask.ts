import base = require("./base/RedisCmdTask");
import log = require("../../utils/Log");
import util = require("util");

export class GetTask extends base.RedisCmdTask {

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
        } else {
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

        this.data.get(key, function (error, result) {
            if (error == null) {
                if (result == null) {
                    //key不存在居然不算error
                    self.AbortWithError(util.format("redis >get error: key=%s not exists", key));
                } else {
                    self.DoneWithResult(result, util.format("redis >get finish: key=%s result=%s", key, result));
                }
            }
            else {
                self.AbortWithError(util.format("redis >get error: key=%s error=%s", key, error));
            }
        });
    }
}