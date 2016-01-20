import task = require("../../tasking/Task");
import log = require("../../../utils/Log");

export class SelectDBTask extends task.Task {

    static DB_DEVICE_MAP = 0;                   // key: deviceID, value: set<userID>
    static DB_USER_MAP = 1;                     // key: userID, value: deviceID
    static DB_PENDING_MAP = 2;                  // key: userID, value: set<messageID>
    static DB_MESSAGE_MAP = 3;                  // key: messageID, value: querystring

    public dbindex: number;

    constructor( client:any, dbIndex:number ) {
        super(client);
        this.dbindex = dbIndex;
    }

    Execute() {
        super.Execute();
        var self = this;
        this.data.select(this.dbindex, function (error) {
            if (error) {
                log.error("SelectDBTask", "redis select error:%s", error);
                self.Abort();
            }
            else {
                log.debug("SelectDBTask", "redis select done:%d", self.dbindex);
                self.Done();
            }
        } );
    }
}