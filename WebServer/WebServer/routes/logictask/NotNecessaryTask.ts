import base = require("../../tasking/Task");

export class NotNecessaryTask extends base.Task {
    constructor(task: base.Task) {
        super(task);
    }

    Execute() {
        super.Execute();
        var self = this;
        var task: base.Task = this.data;
        task.once("complete", function () {
            self.Done();
        });
        task.once("abort", function () {
            self.Done();
        });
        task.Execute();
    }
}