// need to implement for release

import fs = require("fs");
import util = require("util");
var Console = require("console").Console
var loggers = new Object();

function getLogger(tag): any {
    if (loggers[tag] == undefined) {
        var out = fs.createWriteStream("log/runtime.log");
        loggers[tag] = new Console(out, out);
    }
    return loggers[tag];
}

function getTime(): string{
    var d: Date = new Date();
    return util.format("%s-%s-%s %s:%s:%s.%s",
        d.getFullYear(),
        String("00" + (d.getMonth() + 1)).slice(-2),
        String("00" + d.getDate()).slice(-2),
        String("00" + d.getHours()).slice(-2),
        String("00" + d.getMinutes()).slice(-2),
        String("00" + d.getSeconds()).slice(-2),
        String("000" + d.getMilliseconds()).slice(-3)
        );
}

export function debug(tag: string, format: string, ...args): void {
    var temp = args.slice();
    temp.unshift(getTime() + "[DEBUG]<" + tag + "> " + format);
    console.debug.apply(console, temp);
    var filelogger = getLogger(tag);
    filelogger.log.apply(filelogger, temp);
}

export function info(tag: string, format: string, ...args): void {
    var temp = args.slice();
    temp.unshift(getTime() + "[INFO] <" + tag + "> " + format);
    console.info.apply(console, temp);
    var filelogger = getLogger(tag);
    filelogger.log.apply(filelogger, temp);
}

export function warn(tag: string, format: string, ...args): void {
    var temp = args.slice();
    temp.unshift(getTime() + "[WARN] <" + tag + "> " + format);
    console.warn.apply(console, temp);
    var filelogger = getLogger(tag);
    filelogger.log.apply(filelogger, temp);
}

export function error(tag: string, format: string, ...args): void {
    var temp = args.slice();
    temp.unshift(getTime() + "[ERROR]<" + tag + "> " + format);
    console.error.apply(console, temp);
    var filelogger = getLogger(tag);
    filelogger.log.apply(filelogger, temp);
}

export function fatal(tag: string, format: string, ...args): void {
    var temp = args.slice();
    temp.unshift(getTime() + "[FATAL]<" + tag + "> " + format);
    console.error.apply(console, temp);
    var filelogger = getLogger(tag);
    filelogger.log.apply(filelogger, temp);
}
