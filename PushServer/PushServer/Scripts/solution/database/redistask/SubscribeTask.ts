import task = require("../../tasking/Task");
import log = require("../../../utils/Log");

export class SubscribeTask extends task.Task {

    public channel: string;
    private processor: Function;

    constructor(client: any, chan: string, callback: Function) {
        super(client);
        this.channel = chan;
        this.processor = callback;
    }

    Execute() {
        super.Execute();
        var self = this;
        this.data.subscribe(this.channel, function (error) {
            if (!error) {
                self.Done();
                log.debug("SubscribeTask", "subscribe done: channel=%s", self.channel);
            }
            else {
                self.Abort();
                log.error("SubscribeTask", "subscribe error: channel=%s", self.channel);
            }
        });
    }

    Done() {
        super.Done();
        var self = this;
        this.data.on("message", function (channel, message) {
            self.processor(channel);
            log.debug("SubscribeTask", "got msg pushed: channel=%s", self.channel);
        });
    }
}
