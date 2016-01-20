import task = require("../../tasking/Task");
import log = require("../../../utils/Log");

export class SMembersTask extends task.Task {

    public queryKey: string;
    public result: Array<string>;

    constructor(client: any, key: string) {
        super(client);
        this.queryKey = key;
    }

    Execute() {
        super.Execute();
        var self = this;
        this.data.smembers(this.queryKey, function (error, result) {
            if (error == null) {
                self.result = result;
                log.debug("SMembersTask", "redis smember: key=%s, result=%s", self.queryKey, result);
                self.Done();
            }
            else {
                log.error("SMembersTask", "redis smember error:%s", error);
                self.Abort();
            }
        });
    }
}