import task = require("./Task");
import assert = require("assert");

export class TaskQueue extends task.Task{

    private length: number;
    private cursor: number;
    private queue: Array<task.Task>;

    constructor( data:any=undefined ) {
        super(data);
        this.Reset();
    }

    Reset() {
        this.length = 0;
        this.cursor = 0;
        this.queue = new Array<task.Task>();
    }

    AddTask(t: task.Task) {
        assert(this.cursor == 0, "task queue state unmatch");

        this.queue.push(t);
        this.length++;
    }

    private PopTask(): task.Task {
        assert(this.cursor >= 0, "pop task cancel");
        assert(this.cursor < this.length, "no task to pop");

        var retval = this.queue[this.cursor];
        this.cursor++;
        return retval;
    }

    Execute() {
        super.Execute();
        if (this.cursor < this.length) {
            var task = this.PopTask();
            var queue = this;
            task.once("complete", function () {
                queue.OnScheduleNext();
            });
            task.once("abort", function () {
                queue.Abort();
            })
            task.Execute();
        }
        else {
            this.Done();
            this.Reset();
        }
    }

    private OnScheduleNext() {
        var queue:TaskQueue = this;
        setImmediate(function () {
            queue.Execute();
        });
    }
}