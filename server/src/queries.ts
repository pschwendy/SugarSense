import { Pool } from 'pg';
import { dexcom } from './dexcom';

interface ConnectionString {
    user?: string;
    password?: string;
    database?: string;
    port?: number;
    connectionString?: string;
    ssl?: object;
}

const env = process.env.NODE_ENV || 'development';

let connectionString: ConnectionString = {
    user: 'clarify',
    password: 'supersecretpassword',
    port: 5432,
};

if (env === 'development') {
    connectionString.database = 'clarify_db';
} else {
    connectionString = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    };
};

/**
 * Collection of database queries to access Dexcom information
 * @class
 */
class Queries {
    pool: Pool;
    accessTimeouts: Array<NodeJS.Timer>;

    constructor() {
        this.pool = new Pool(connectionString);
        console.log("HI!")
        this.pool.connect().then(() => { console.log("CONNECTED!") }).catch((err) => { console.log(err) });
        this.accessTimeouts = new Array<NodeJS.Timer>();
    }

    /**
     * Creates a user based on token information provided by Dexcom OAuth
     * @param accessToken access token granted through Dexcom OAuth
     * @param refreshToken refresh token used to renew the access token after the access token expires
     * @param accessTime amount of time before the access token expires
     */
    async createUser(accessToken: string, refreshToken: string, accessTime: number) {
        let insertSQL = {
            text: "INSERT INTO learning_data (access_token, refresh_token, access_time) VALUES ($1, $2, now() + $3 * interval '1 second')",
            values: [accessToken, refreshToken, accessTime]
        };
        
        await this.pool.query(insertSQL);
        
        let selectSQL = {
            text: "SELECT pk FROM learning_data WHERE access_token=$1",
            values: [accessToken]
        }; 

        let rows = await this.pool.query(selectSQL);
        if (!rows) {
            throw Error ("No rows found with inserted access_token");
        }

        const pk = rows.rows[0].pk;
        this.accessTimeouts.push(setInterval(() => {
            this.getAccessToken(pk)
            .then(accessToken => {
                dexcom.renew(accessToken);
            });
        }, accessTime - 200))

        return pk;
    } // createUser()

    /**
     * Updates token information after refreshing tokens
     * @param accessToken access token granted through Dexcom OAuth
     * @param refreshToken refresh token used to renew the access token after the access token expires
     * @param accessTime amount of time before the access token expires
     */
    renewAccess(accessToken: string, refreshToken: string, accessTime: number) {
        let updateSQL = {
            text: "UPDATE learning_data set access_token=$1, refresh_token=$2, access_time=(now() + $3 * interval '1 second')",
            values: [accessToken, refreshToken, accessTime]
        };
        
        this.pool.query(updateSQL);
    } // renewAccess()

    /**
     * Gets the access token corresponding to the given primary key
     * @param pk primary key of row being queried for
     * @returns access token at the row corresponding to pk
     */
    async getAccessToken(pk: number) {
        let selectSQL = {
            text: "SELECT access_token FROM learning_data WHERE pk=$1",
            values: [pk]
        }; 
        
        console.log("SELECTING ACCESS TOKEN");

        const rows = await this.pool.query(selectSQL);
        console.log("SELECTED ACCESS TOKEN: ", rows)
        const accessToken = rows.rows[0].access_token;
        
        return accessToken;
    } // getAccessToken()

    /**
     * Gets the refresh token corresponding to the given primary key
     * @param pk primary key of row being queried for
     * @returns access token at the row corresponding to pk
     */
     async getRefeshToken(pk: number) {
        let selectSQL = {
            text: "SELECT access_token FROM learning_data WHERE pk=$1",
            values: [pk]
        }; 

        const rows = await this.pool.query(selectSQL);
        const refreshToken = rows.rows[0].refresh_token;
        
        return refreshToken;
    } // getRefeshToken()

    /**
     * Gets the access token corresponding to the given primary key
     * @param pk primary key of row being queried for
     * @returns access token at the row corresponding to pk
     */
     async accessExpired(pk: number) {
        let selectSQL = {
            text: "SELECT access_time FROM learning_data WHERE pk=$1",
            values: [pk]
        }; 

        const rows = await this.pool.query(selectSQL);
        const expireTime = rows.rows[0].access_time;
        
        const expireDate = new Date(expireTime);
        const currentDate = new Date();

        return expireDate < currentDate;
    } // getAccessToken()
};

export const queries = new Queries();