import event = require("events");

enum TaskState {
    CREATED,
    RUNNING,
    ABORTED,
    FINISH
}

export class Task extends event.EventEmitter {
    data: any;

    private state: TaskState;

    constructor( data=undefined ) {
        super();
        this.data = data;
        this.state = TaskState.CREATED;
    }

    Execute() {
        if (this.state == TaskState.CREATED) {
            this.state = TaskState.RUNNING;
        }
    }

    IsRunning() {
        return this.state == TaskState.RUNNING;
    }

    Abort() {
        if (this.state == TaskState.RUNNING) {
            this.emit("abort", this);
            this.state = TaskState.ABORTED;
        }
    }

    Done() {
        if (this.state == TaskState.RUNNING) {
            this.emit("complete", this);
            this.state = TaskState.FINISH;
        }
    }
}