import axios from "axios";
import { escape } from "mysql";
import { PhishingDTO } from "../../../dtos/message.dto";
import { saveError } from "../../../functions/logger";

export default class Phishing {

    /**
     * @description This function will check the URL againsts Phishing Databases
     * @param {string} url
     * @return {*}  {Promise<PhishingDTO>}
     * @memberof Phishing
     */
    public async check(url: string): Promise<PhishingDTO> {
        url = url.toLocaleLowerCase();
        url = url.replace(/^(https|http)?:\/\//, "");

        let detections:number = 0;
        let checkedBy:string = "";
        let isBlocked:boolean = false;
        let hasErrorName:string = "";
        await axios.get(
            `https://phish.sinking.yachts/v2/check/${escape(url, true)}`,
            {
                headers: {
                    "X-Identity": "https://api.scarletai.xyz",
                },
                timeout: 5000,
            }
        ).then(async (res) => {
            const LOP = await res.data;
            if (LOP === true) {
                detections++;
                checkedBy += "Phish.Sinking.Yachts, ";
                isBlocked = true;
                // Next we'll run a second check against phishtank to eliminate false positives
                const phishTank = await this.phishTank(url);
                if (phishTank === true) {
                    detections++;
                    checkedBy += "PhishTank";
                    isBlocked = true; // We'll add as true for redundancy
                }
            }
        }).catch((err) => {
            saveError(err);
            isBlocked = false;
            detections = 0;
            hasErrorName = err.name;
        });

        if (hasErrorName.length > 0) {
            return {
                detections: detections,
                blocked: isBlocked,
                reason: "string",
                domain: url,
                checkedBy: checkedBy,
                checkedAt: new Date().toISOString(),
                error: hasErrorName,
            }
        } else {
            return {
                detections: detections,
                blocked: isBlocked,
                reason: "string",
                domain: url,
                checkedBy: checkedBy,
                checkedAt: new Date().toISOString(),
            }
        }
    }
    
    /**
     * @description This function will check the URL against PhishTank
     * @private
     * @param {string} url
     * @return {*}  {Promise<boolean>}
     * @memberof Phishing
     */
    private async phishTank(url: string): Promise<boolean | unknown> {
        const results = await axios.get(
            "https://data.phishtank.com/data/online-valid.json",
            {
                headers: {
                    "User-Agent": "ScarletAI",
                }
            }
        ).then(async (res) => {
            const LOP:any = await res.data;
            for (let i = 0; i < LOP.length; i++)
            {
                if (
                    (LOP[i].url === `http://${url}` || LOP[i].url === `https://${url}`)
                    && LOP[i].verified === true
                ) {
                    return true;
                }
            }
        }).catch((err) => {
            console.log(err);
            return false;
        });

        return results;
    }
}
