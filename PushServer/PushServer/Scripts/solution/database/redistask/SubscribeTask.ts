import task = require("../../tasking/Task");
import log = require("../../../utils/Log");
import events = require("events");

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
        SubscribeTask.attachListener(this.channel, this.processor);

        var emitter: events.EventEmitter = this.data;
        if (emitter.listeners("message").length == 0) {
            emitter.on("message", SubscribeTask.handleMessage);
        }
    }

    static listeners: Object;
    static attachListener(channel: string, processor: Function) {
        if (SubscribeTask.listeners == null) {
            SubscribeTask.listeners = {};
        }
        SubscribeTask.listeners[channel] = processor;
    }

    static handleMessage(channel: string, message: string) {
        if (SubscribeTask.listeners != null) {
            log.debug("SubscribeTask", "got msg pushed: channel=%s", channel);

            var fun: Function = SubscribeTask.listeners[channel];
            if (fun != null) {
                fun( channel );
            }
        }
    }
}
