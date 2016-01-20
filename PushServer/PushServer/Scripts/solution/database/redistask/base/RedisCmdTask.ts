import task = require("../../../tasking/Task");
import log = require("../../../../utils/Log");

export class RedisCmdTask extends task.Task {

    public error: any;
    public result: any;
    public isRedisCmdTask: boolean;

    constructor(client: any) {
        super(client);
        this.isRedisCmdTask = true;
    }

    DoneWithResult(result: any, logs: string): void {
        log.debug("RedisCommand", logs);
        this.result = result;
        this.Done();
    }

    AbortWithError(error: string): void {
        log.error("RedisCommand", error);
        this.error = error;
        this.Abort();
    }
}