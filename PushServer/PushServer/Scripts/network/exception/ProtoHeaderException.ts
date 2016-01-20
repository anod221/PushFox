export class ProtoHeaderException {
    public message: string = "协议头格式异常";
    public stack: string;

    constructor() {
        this.stack = new Error()["stack"];
    }
}