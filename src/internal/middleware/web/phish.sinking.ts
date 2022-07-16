import CacheManager from '../../../common/services/CacheManager';
export async function PhishingDetect(domain: string) {
    domain.toLowerCase();
    let detections: number = 0;
    const res = await fetch(`https://phishing.sinking.yachts/all`, {
        method: "GET",
        headers: {
            "X-Identity": "https://scarletai.xyz"
        }
    });
     
    const listofphishing = await res.json();
    let localEntries: any;
    new CacheManager().set("sites", listofphishing);
    new CacheManager().get("sites").then((sites) => {
        localEntries = sites.find((x) => domain == x.domain || domain.endsWith(`.${x.domain}`));
    })

    let fromDB = listofphishing.find((x:any) => domain == x.domain || domain.endsWith(`.${x.domain}`));

    if (localEntries) {
        detections += 1;
        return {
            detections: detections,
            blocked: true,
            reason: localEntries.reason || "No Reason provided",
            domain: domain,
        };
    } else if (fromDB) {
        return {
            detections: detections,
            blocked: true,
            reason: "Checked externally from: [phish.sinking.yachts]",
            domain: domain
        }
    } else {
        return {
            blocked: false
        }
    }
};