﻿import assert = require("assert");
import event = require("events");

import idev = require("./interf/IDevice");
import tasking = require("../tasking/Task");

import iterm = require("../../network/ITerminal");
import access = require("../database/IDataAccessor");
import log = require("../../utils/Log");

export class Device implements idev.IDevice {
    private static TAG = "Device";

    private active: boolean;
    private param: Object;
    private udid: string;
    private refTerminal: iterm.ITerminal;
    private emitter: event.EventEmitter;
    private isBusy: boolean;            //如果PushTask正在执行就设为true，否则设为false
    private isPending: boolean;         //如果PushTask正在执行的时候收到publish的广播，就设置一下

    constructor(terminal:iterm.ITerminal, info: Object) {
        assert(info != null, "设备参数为空");
        this.param = info;
        this.active = false;
        this.refTerminal = terminal;
        this.emitter = new event.EventEmitter();
        this.udid = this.GetDeviceParameter("udid");
        log.info( Device.TAG, "got device: udid=%s", this.udid );
    }

    // 设备唯一编号
    GetDeviceUniqueID(): string {
        return this.udid;
    }

    GetTerminal(): iterm.ITerminal {
        return this.refTerminal;
    }

    GetEventEmitter(): event.EventEmitter {
        return this.emitter;
    }

    GetDeviceParameter(key: string): any {
        return this.param[key];
    }

    IsActive(): boolean {
        return this.active;
    }

    Start(): void {
        this.active = true;
        var self = this;
        // 1 增加频道订阅
        access.Instance().SetPushProcessor(this, function () {
            self.OnNewPush();
        });
        // 2 获取设备pending信息
        self.OnNewPush();
    }

    Destroy(): void {
        if (this.active) {
            // 取消推送监听
            access.Instance().SetPushProcessor(this, null);
            // 清理事件监听
            this.emitter.emit("exit", this);
            this.emitter.removeAllListeners();
            // 关闭频道订阅
            this.emitter = null;
            this.refTerminal = null;
            this.param = null;
            this.active = false;
        }
    }

    private OnNewPush(): void {
        if (!this.isBusy) {
            var self = this;
            access.Instance().PushByDevice(this, function (task: tasking.Task) {
                self.DoPush(task);
            });
        } else {
            this.isPending = true;
        }
    }

    private DoPush(task: tasking.Task): void {
        if (!this.isBusy) {
            // 只有空闲的时候才可以推送
            this.isBusy = true;
            var self = this;
            task.once("complete", function () {
                log.debug("Device", "device push done: id=%s", self.udid);
                self.isBusy = false;
                if (self.isPending) {
                    self.isPending = false;
                    setImmediate(function () { self.OnNewPush() });
                }
            });
            task.Execute();
        }
    }
}