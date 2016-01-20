import http = require("http");
import util = require("./utils/Util");

export function bind(req: any, resp: any) {
    var appid = req.query.appid;
    var userid = req.query.user;
    var deviceid = req.query.udid;
    var signature = req.query.sign;

    // 参数检查
    var error: string = null;
    if (appid == undefined) {
        error = "/error?why=noappid";
    }
    if (userid == undefined) {
        error = "/error?why=nouser";
    }
    if (deviceid == undefined) {
        error = "/error?why=noudid";
    }
    if (error) {
        resp.redirect(error);
        return;
    }

    var user: string = util.generateUser(appid, userid);
    util.updateUser(user, deviceid, function (error) {
        if (error == null) {
            resp.json({ result: 200, message: "opeartion finish" });
        } else {
            resp.json({ result: 404, message: String(error) });
        }
    });
}

export function unbind(req: any, resp: any): void {
    var appid = req.query.appid;
    var userid = req.query.user;
    var signature = req.query.sign;

    // 参数检查
    var error: string = null;
    if (appid == undefined) {
        error = "/error?why=noappid";
    }
    if (userid == undefined) {
        error = "/error?why=nouser";
    }
    if (error) {
        resp.redirect(error);
        return;
    }

    var user: string = util.generateUser(appid, userid);
    util.deleteUser(user, function (error) {
        if (error == null) {
            resp.json({ result: 200, message: "opeartion finish" });
        } else {
            resp.json({ result: 404, message: String(error) });
        }
    });
}