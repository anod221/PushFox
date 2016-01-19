import task = require("../../tasking/Task");
import log = require("../../../utils/Log");

export class GetTask extends task.Task {

    public queryKey: string;
    public result: any;

    constructor(client: any, key: string) {
        super(client);
        this.queryKey = key;
    }

    Execute() {
        super.Execute();
        var self = this;
        this.data.getAsync(this.queryKey, function (error, result) {
            if (error == null) {
                self.result = result;
                log.debug("GetTask", "redis get[%s]=%s", self.queryKey, result);
                self.Done();
            }
            else {
                log.error("GetTask", "redis get error:%s", error);
                self.Abort();
            }
        });
    }
}