import net = require("net");
import assert = require("assert");
import iterm = require("./ITerminal");
import term = require("./Terminal");
import log = require("../utils/Log");

// 管理连接到server的客户终端
export class ConnectionMgr {
    private static TAG = "ConnectionMgr";

    private connections: Object;
    private idinc: number;

    private static inst;
    static Instance(): ConnectionMgr {
        if (ConnectionMgr.inst == null) {
            ConnectionMgr.inst = new ConnectionMgr();
        }
        return ConnectionMgr.inst;
    }

    constructor() {
        this.connections = {}
        this.idinc = 0;
    }

    CreateTerminal(conn: net.Socket): iterm.ITerminal {
        // 保存id
        this.idinc = this.idinc + 1;

        // 创建终端
        var retval = new term.Terminal(this.idinc, this, conn);
        this.connections[this.idinc] = retval;

        log.info(ConnectionMgr.TAG, "got new terminal:%s, assign by id:%d", conn.remoteAddress, retval.id);
        return retval;
    }

    RemoveTerminal(id: number): void {
        assert(term, "term参数不能为空");
        log.info(ConnectionMgr.TAG, "remove terminal by id: %d", id);
        delete this.connections[id];
    }
}
