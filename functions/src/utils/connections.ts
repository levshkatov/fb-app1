export class Connections {

    private static _dbConnection: any;
    private static _avatarBucket: any;
    private static _admin: any;

    static get admin(): any {
        return this._admin;
    }

    static set admin(admin: any) {
        this._admin = admin;
    }

    static get dbConnection(): any {
        return this._dbConnection;
    }

    static set dbConnection(dbConnection: any) {
        this._dbConnection = dbConnection;
    }

    static get avatarBucket(): any {
        return this._avatarBucket;
    }

    static set avatarBucket(bucket: any) {
        this._avatarBucket = bucket;
    }

}
