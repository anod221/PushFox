import net = require("net");
import iterm = require("../ITerminal");
import reader = require("../data/ReqReader");
import io = require("../../utils/ByteArray")
import phexc = require("../exception/ProtoHeaderException");
import log = require("../../utils/Log");

export class SocketOpeartor {
    private static TAG: string = "SocketOperator";
    static TIME_FOR_HEARTBEAT: number = 5*60 * 1000;             //一个socket在5分钟没数据就关闭

    public refConnection: net.Socket;
    public refTerminal: iterm.ITerminal;
    private reqReader: reader.ReqReader;
    private timeOfData: number;                             //上次接收到数据时间
    private timer: any;                                     //检查心跳的计时器

    constructor(conn: net.Socket, term: iterm.ITerminal) {
        this.refConnection = conn;
        this.refTerminal = term;
        this.reqReader = new reader.ReqReader();
        this.timeOfData = 0;
        this.timer = null;
        this.AddOperator();
    }

    AddOperator(): void {
        var self = this;
        this.refConnection.once('close', function (b) {
            self.OperationClose(b)
        });

        this.refConnection.on('data', function (buffer) {
            self.OperationData(buffer);
        });

        this.refConnection.on('error', function (err) {
            self.OperationError(err);
        });

        this.timer = setTimeout(function () {
            self.OperationHeartBeat()
            }, SocketOpeartor.TIME_FOR_HEARTBEAT);
    }

    OperationClose(has_error: boolean): void {
        // 处理socket关闭事件
        this.refConnection.removeAllListeners();
        if (this.timer != null) {
            clearTimeout(this.timer);
        }
        this.refTerminal.Destroy();
    }

    OperationData(buffer: Buffer): void {
        // 处理socket数据事件
        this.timeOfData = Math.floor(new Date().getTime());
        log.info(SocketOpeartor.TAG, "receive data: terminal=%d, size=%d", this.refTerminal.id, buffer.length);

        var accesssor = io.ByteArray.FromBuffer(buffer);
        while (true) {
            try {
                var req = this.reqReader.Read(accesssor);
                if (req == null) {
                    break;
                }

                req.Process( this.refTerminal );
            }
            catch (error) {
                // 协议有问题
                this.refTerminal.Disconnect();
                log.error(SocketOpeartor.TAG, "get data error:%s", error);
                log.fatal(SocketOpeartor.TAG, "invalid network data: ip=%s", this.refConnection.remoteAddress);
                break;
            }
        }
    }

    OperationError(error: Error): void {
        // 处理socket错误，没法处理，直接打印
        log.error(SocketOpeartor.TAG, "socket error: name=%s, msg=%s", error.name, error.message);
    }

    OperationHeartBeat(): void {
        // 心跳检查
        var now = Math.floor(new Date().getTime());
        if (Math.abs(this.timeOfData - now) > SocketOpeartor.TIME_FOR_HEARTBEAT) {
            this.timer = null;
            this.refTerminal.Disconnect();
        }
        else {
            // 准备下一个心跳
            var self = this;
            this.timer = setTimeout(function () {
                self.OperationHeartBeat()
            }, SocketOpeartor.TIME_FOR_HEARTBEAT);
        }
    }
}
