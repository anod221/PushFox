import util = require("util");

import tq = require("../../tasking/TaskQueue");

import tset = require("../redistask/SetTask");
import tget = require("../redistask/GetTask");
import tsel = require("../redistask/SelectDBTask");
import tdel = require("../redistask/DelTask");
import tsadd = require("../redistask/SAddTask");
import tsrem = require("../redistask/SRemTask");
import tsmem = require("../redistask/SMembersTask");
import tincr = require("../redistask/IncrTask");
import tpub = require("../redistask/PublishTask");

import tskip = require("../logictask/NotNecessaryTask");
import tsearch = require("../logictask/SearchMsgTask");

var redis = require("redis");
var redisClient = redis.createClient({ host: "localhost", port: 6379 });

class UserOption {
    private options: Array<tq.TaskQueue>;
    private isBusy: boolean;

    constructor() {
        this.options = new Array<tq.TaskQueue>();
    }

    NewOption(task: tq.TaskQueue): void {
        this.options.push(task);
        this.Schedule();
    }

    private Schedule(): void {
        var self = this;
        if (!this.isBusy) {
            var task = this.PopTask();
            if (task == null) {
                return;
            }

            this.isBusy = true;
            task.once("complete", function () {
                self.isBusy = false;
                self.Schedule();
            });
            task.once("abort", function () {
                self.isBusy = false;
                self.Schedule();
            });

            task.Execute();
        }
    }

    private PopTask(): tq.TaskQueue {
        return this.options.shift();
    }
}

class UserOptionMgr {
    private static optMap: Object;
    static getUserOption(user: string): UserOption {
        if (UserOptionMgr.optMap == null) {
            UserOptionMgr.optMap = new Object();
        }
        if (!UserOptionMgr.optMap.hasOwnProperty(user)) {
            UserOptionMgr.optMap[user] = new UserOption();
        }
        return UserOptionMgr.optMap[user];
    }
}

export function generateUser(appid: string, userid: string): string {
    return util.format("%s@%s", userid, appid);
}

export function updateUser(user: string, udid: string, callback: Function= null): void {
    var task: tq.TaskQueue = createUpdateUserTask(user, udid, callback);
    UserOptionMgr.getUserOption(user).NewOption(task);
}

export function deleteUser(user: string, callback: Function = null): void {
    var task: tq.TaskQueue = createDeleteUserTask(user, callback);
    UserOptionMgr.getUserOption(user).NewOption(task);
}

function createUpdateUserTask(user: string, udid: string, callback: Function): tq.TaskQueue {
    //       deleteUser( user )，然后再执行：
    //       1 往数据库0中key=udid的集合sadd上user
    //       2 往数据库1中key=user的字符串设置为udid
    var tasks: tq.TaskQueue = new tq.TaskQueue();
    var delusertask = createDeleteUserTask(user, null);
    tasks.AddTask(new tskip.NotNecessaryTask(delusertask));
    tasks.AddTask(new tsel.SelectDBTask(redisClient, tsel.SelectDBTask.DB_DEVICE_MAP));
    tasks.AddTask(new tsadd.SAddTask(redisClient, udid, user));
    tasks.AddTask(new tsel.SelectDBTask(redisClient, tsel.SelectDBTask.DB_USER_MAP));
    tasks.AddTask(new tset.SetTask(redisClient, user, udid));

    if (callback != null) {
        tasks.once("complete", function () {
            callback(null);
        });
        tasks.once("abort", function () {
            callback(tasks.CurrentTask()["error"]);
        });
    }

    return tasks;
}

function createDeleteUserTask(user: string, callback: Function): tq.TaskQueue {
    //       1 往数据库1中找到key=user的字符串udid
    //       2 删除数据库1中key=user的记录
    //       3 在数据库0中对key=udid的集合sdel上user
    var tasks: tq.TaskQueue = new tq.TaskQueue();

    tasks.AddTask(new tsel.SelectDBTask(redisClient, tsel.SelectDBTask.DB_USER_MAP));
    var findtask: tget.GetTask = new tget.GetTask(redisClient, user);
    tasks.AddTask(findtask);
    tasks.AddTask(new tdel.DelTask(redisClient, user));
    tasks.AddTask(new tsel.SelectDBTask(redisClient, tsel.SelectDBTask.DB_DEVICE_MAP));
    tasks.AddTask(new tsrem.SRemTask(redisClient, findtask, user));

    if (callback) {
        tasks.once("complete", function () {
            callback(null);
        });
        tasks.once("abort", function () {
            callback(tasks.CurrentTask()["error"]);
        });
    }

    return tasks;
}

function createUserMessageTask(user: string, msg: string, callback: Function): tq.TaskQueue {
    var tasks: tq.TaskQueue = new tq.TaskQueue();

    //       1 重复推送检查
    //         1 从数据库1中得到key=user的字符串udid
    //         2 从数据库3中得到key=udid的集合queue
    //         3 对于queue中的每一个key，在数据库4中查找出真实的msg
    //         4 对3中每一个msg和参数msg是否相同，出现一个相同则抛弃当前操作
    var step1: tq.TaskQueue = tasks;
    step1.AddTask(new tsel.SelectDBTask(redisClient, tsel.SelectDBTask.DB_USER_MAP));
    var findudidtask: tget.GetTask = new tget.GetTask(redisClient, user);
    step1.AddTask(findudidtask);
    step1.AddTask(new tsel.SelectDBTask(redisClient, tsel.SelectDBTask.DB_PENDING_MAP));
    var findmsgstask: tsmem.SMembersTask = new tsmem.SMembersTask(redisClient, findudidtask);
    step1.AddTask(findmsgstask);
    step1.AddTask(new tsearch.SearchMsgTask(redisClient, findmsgstask, msg));

    //       2 消息加入推送队列
    //         1 从数据库4中对key="idInc"进行INCR，得到数值id
    //         2 往数据库4中key=id的字符串设置为参数msg
    //         3 往数据库3中key=udid的集合sadd上id
    var step2: tq.TaskQueue = tasks;
    step2.AddTask(new tsel.SelectDBTask(redisClient, tsel.SelectDBTask.DB_MESSAGE_MAP));
    var incridtask: tincr.IncrTask = new tincr.IncrTask(redisClient, "idInc");
    step2.AddTask(incridtask);
    step2.AddTask(new tset.SetTask(redisClient, incridtask, msg));
    step2.AddTask(new tsel.SelectDBTask(redisClient, tsel.SelectDBTask.DB_PENDING_MAP));
    step2.AddTask(new tsadd.SAddTask(redisClient, findudidtask, incridtask));

    //       3 发送消息到PushServer进行处理
    //         1 使用publish udid来实现
    var step3: tq.TaskQueue = tasks;
    step3.AddTask(new tpub.PublishTask(redisClient, findudidtask, "newmessage"));

    if (callback) {
        tasks.once("complete", function () {
            callback(null);
        });
        tasks.once("abort", function () {
            callback(tasks.CurrentTask()["error"]);
        });
    }

    return tasks;
}

export function addUserMessage(user: string, msg: string, callback: Function): void {
    var task: tq.TaskQueue = createUserMessageTask(user, msg, callback);
    UserOptionMgr.getUserOption(user).NewOption(task);
}
