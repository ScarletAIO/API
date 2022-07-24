import axios from "axios";
export async function PhishingDetect(domain: string) {
    let detections: number = 0;
    const res = await axios.get(`https://phish.sinking.yachts/v2/check/${domain}`, {
        headers: {
            "X-Identity": "https://scarletai.xyz"
        },
        timeout: 5000,
    });
    
    const listofphishing = await res.data;
    if (res.status === 404) {
        return {
            blocked: false,
            detections: 0,
            domain: domain,
            reason: "Not in Database"
        }
    }

    if (listofphishing === true) {
        return {
            detections: detections,
            blocked: true,
            reason: "Checked externally from: [phish.sinking.yachts]",
            domain: domain,
        };
    } else {
        return {
            detections: detections,
            blocked: false,
            reason: "Checked externally from: [phish.sinking.yachts]",
            domain: domain,
        };
    }
};