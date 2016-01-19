import device = require("./IDevice");
export interface IUser {
    id: string;
    GetAppID(): string;
    GetUserID(): string;
    GetDevice(): device.IDevice;
}