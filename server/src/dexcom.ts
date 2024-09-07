import { URLSearchParams } from "url"
import http from "https";
import { queries } from "./queries";
import dotenv from "dotenv";
import fetch from "cross-fetch";
import fs from "fs"; 

dotenv.config();

interface Token {
    access_token: string;
    expires_in: number;
    token_type: string;
    refresh_token: string;
}

/**
 * Connects to dexcom client and collects data for learning later
 * Methods called on server api GET requests
 * @class
 */
class Dexcom {
    clientSecret: string | undefined;
    clientID: string | undefined;
    authorizationCode: string | undefined;
    token: Token | undefined;

    /**
     * Creates Dexcom instance
     * Sets member variables to env variables
     */
    constructor() {
        this.clientSecret = process.env.DEXCOM_CLIENT_SECRET;
        this.clientID = process.env.DEXCOM_CLIENT_ID;
    }

    /**
     * Gets access and refresh tokens
     * @param {string} authorizationCode authorization code from dexcom redirect
     */
    async authorize(authorizationCode: string, callback: Function) {
        this.authorizationCode = authorizationCode;
        const formData = {
            client_secret: this.clientSecret as string,
            client_id: this.clientID as string,
            code: this.authorizationCode as string,
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:3000/api/login'
        };

        const resp = await fetch(
            'https://sandbox-api.dexcom.com/v2/oauth2/token', 
            {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(formData).toString()
        });

        const data: any = await resp.text();

        // 
        console.log(data);

        this.token = {
            access_token: data['access_token'],
            expires_in: data['expires_in'],
            token_type: data['token_type'],
            refresh_token: data['refresh_token']
        }
    } // authorize()

    renew(refreshToken: string) { 
        var options = {
            "method": "POST",
            "hostname": "api.dexcom.com",
            "port": null,
            "path": "/v2/oauth2/token",
            "headers": {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache"
            }
        };

        var req = http.request(options, function (res) {
            var chunks: Array<any> = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function () {
                var body = Buffer.concat(chunks);
                console.log(body.toString());
            });
        });

        req.write(new URLSearchParams({ 
            client_secret: this.clientSecret as string,
            client_id: this.clientID as string,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            redirect_uri: 'http://localhost:3000/api/login' 
        }).toString());

        req.end();
    } // renew()

    async egvs(accessToken: string) { 
        const query = new URLSearchParams({
            startDate: '2024-08-28T07:41:55',
            endDate: '2024-09-01T06:01:53'
        }).toString();

        const resp = await fetch(
            `https://sandbox-api.dexcom.com/v2/users/self/egvs?${query}`,
            {
                method: 'GET',
                headers: {
                Authorization: 'Bearer ' + accessToken
                }
            }
        );

        const data = await resp.text();
        console.log(data);
    } // egvs()

    async dataRange(accessToken: string) { 
        const resp = await fetch(
            `https://sandbox-api.dexcom.com/v2/users/self/dataRange`,
            {
              method: 'GET',
              headers: {
                Authorization: 'Bearer ' + accessToken
              }
            }
        );

        const data = await resp.text();
        console.log(data);
    } // egvs()
    
    async events(accessToken: string) { 
        const query = new URLSearchParams({
            startDate: '2024-08-28T07:41:55',
            endDate: '2024-09-01T06:01:53'
        }).toString();

        const resp = await fetch(
            `https://sandbox-api.dexcom.com/v2/users/self/events?${query}`,
            {
                method: 'GET',
                headers: {
                Authorization: 'Bearer ' + accessToken
                }
            }
        );

        const data = await resp.text();
        console.log(data);
    } // events()

    nextMonth(date: Date) {
        var next = new Date();
        if (date.getMonth() == 11) {
            next = new Date(date.getFullYear() + 1, 0, 1);
        } else {
            next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        }
        return next;
    } // nextMonth()

    async collectData(fname: string, accessToken: string) { 
        var date = new Date(2020, 0, 1, 0, 0, 0);

        var insts: any[] = [];
        
        while (date.getFullYear() < 2024) {
            var next = this.nextMonth(date);
            var data = await this.collectDataRange(accessToken, date, next);
            insts = insts.concat(data);
            console.log(data.length);
            console.log(insts.length);
            date = next;
            console.log(date);
        }

        var json = JSON.stringify(insts);

        fs.writeFileSync(fname, json, 'utf8');      
        
    } // collectData()

    async collectDataRange(accessToken: string, date: Date, next: Date) { 
        const query = new URLSearchParams({
            startDate: date.toISOString().slice(0, 19),
            endDate: next.toISOString().slice(0, 19)
        }).toString();

        const resp = await fetch(
            `https://sandbox-api.dexcom.com/v2/users/self/egvs?${query}`,
            {
                method: 'GET',
                headers: {
                Authorization: 'Bearer ' + accessToken
                }
            }
        );

        const data: any = await resp.text();
        
        const egvs = JSON.parse(data).egvs;

        var insts = [];
        var times: any[] = [];

        for(var egv of egvs) {
            let curr = [egv['value'], egv['trendRate'], 0, 0];
            insts.push(curr);
            times.push(egv['systemTime'])
        }

        const resp2 = await fetch(
            `https://sandbox-api.dexcom.com/v2/users/self/events?${query}`,
            {
                method: 'GET',
                headers: {
                Authorization: 'Bearer ' + accessToken
                }
            }
        );

        const ev: any = await resp2.text();
        const events = JSON.parse(ev).events;
        console.log(events.length)

        var j = 0;
        for(var i = 0; i < insts.length; ++i) {
            if (j >= events.length) {
                break;
            }

            while(j < events.length && times[i] <= events[j]['systemTime'] ) {                
                if(events[j]['eventType'] == 'insulin') {
                    insts[i][2] = events[j]['value']
                } else if (events[j]['eventType'] == 'carbs') {
                    insts[i][3] = events[j]['value']
                }
                ++j;
                // console.log(insts[i])
                // console.log(j)
            }
        }
        
        return insts;

        // var json = JSON.stringify(insts);

        // fs.writeFileSync('data.json', json, 'utf8');      
        
    } // collectData()
};

export const dexcom = new Dexcom()
