import http = require("http");
import util = require("./utils/Util");
import fmt = require("util");

export function pushToUser(req: any, resp: any): void {
    var appid = req.query.appid;
    var userid = req.query.user;
    var title = req.query.title;
    var message = req.query.msg;
    var signature = req.query.sign;

    // 参数检查
    var error: string = null;
    if (appid == undefined) {
        error = "/error?why=noappid";
    }
    if (userid == undefined) {
        error = "/error?why=nouser";
    }
    if (message == undefined) {
        error = "/error?why=nomsg";
    }
    if (title == undefined) {
        error = "/error?why=notitle";
    }
    if (error) {
        resp.redirect(error);
        return;
    }

    var user: string = util.generateUser(appid, userid);
    var packmsg: string = fmt.format(
        "u=%s&t=%s&m=%s",
        encodeURIComponent(user),
        encodeURIComponent(title),
        encodeURIComponent(message)
        );
    util.addUserMessage(user, packmsg, function (error) {
        if (error == null) {
            resp.json({ result: 200, message: "opeartion finish" });
        } else {
            resp.json({ result: 404, message: String(error) });
        }
    });
}