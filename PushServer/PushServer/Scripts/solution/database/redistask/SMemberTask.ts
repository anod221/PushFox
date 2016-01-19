import task = require("../../tasking/Task");
import log = require("../../../utils/Log");

export class SMemberTask extends task.Task {

    public queryKey: string;
    public result: Array<string>;

    constructor(client: any, key: string) {
        super(client);
        this.queryKey = key;
    }

    Execute() {
        super.Execute();
        var self = this;
        this.data.smemberAsync(this.queryKey, function (error, result) {
            if (error == null) {
                self.result = result;
                log.debug("SMemberTask", "redis smember: key=%s, result=%s", self.queryKey, result);
                self.Done();
            }
            else {
                log.error("SMemberTask", "redis smember error:%s", error);
                self.Abort();
            }
        });
    }
}