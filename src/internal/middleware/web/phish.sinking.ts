import CacheManager from '../../../common/services/CacheManager';
export async function PhishingDetect(domain: string) {
    domain.toLowerCase();
    let detections: number = 0;
    const res = await fetch(`https://phish.sinking.yachts/v2/check/${domain}`, {
        method: "GET",
        headers: {
            "X-Identity": "https://scarletai.xyz"
        }
    });
     
    const listofphishing = await res.json();
    if (res.status === 400) {
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