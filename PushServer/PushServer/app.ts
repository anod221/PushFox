import net = require("net");
import iterm = require("./Scripts/network/ITerminal");
import mgr = require("./Scripts/network/ConnectionMgr");

function onConnect(conn: net.Socket) {
    var ConnectionMgr = mgr.ConnectionMgr;
    var term: iterm.ITerminal = ConnectionMgr.Instance().CreateTerminal(conn);
    if (term != null) term.Handshake();
}

net.createServer(onConnect).listen(1337);
