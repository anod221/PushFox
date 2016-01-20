import base = require("./base/RedisCmdTask");
import log = require("../../utils/Log");
import util = require("util");

export class SelectDBTask extends base.RedisCmdTask {

    static DB_DEVICE_MAP = 0;                   // key: deviceID, value: set<userID>
    static DB_USER_MAP = 1;                     // key: userID, value: deviceID
    static DB_PENDING_MAP = 2;                  // key: deviceID, value: set<messageID>
    static DB_MESSAGE_MAP = 3;                  // key: messageID, value: querystring

    private db: number;
    private taskAsDB: base.RedisCmdTask;

    constructor( client:any, dbIndex:any ) {
        super(client);
        if (dbIndex instanceof base.RedisCmdTask) {
            this.taskAsDB = dbIndex;
        } else {
            this.db = dbIndex;
        }
    }

    GetDBIndex(): number {
        if (this.taskAsDB == null) {
            return this.db;
        } else {
            return this.taskAsDB.result;
        }
    }

    Execute() {
        super.Execute();
        var self = this;
        var dbindex = this.GetDBIndex();
        this.data.select(dbindex, function (error, result) {
            if (error) {
                self.AbortWithError(util.format("redis >select error: db=%s error=%s", dbindex, error));
            }
            else {
                self.DoneWithResult(result, util.format("redis >select finish: db=%s", dbindex));
            }
        } );
    }
}