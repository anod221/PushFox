export class ProtoReadException {
    public message: string = "协议体格式异常";
    public stack: string;

    constructor() {
        this.stack = new Error()["stack"];
    }
}