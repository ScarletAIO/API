import CacheManager from '../../../common/services/CacheManager';
export async function PhishingDetect(domain: string) {
    domain.toLowerCase();
    let detections: number = 0;
    const res = await fetch(`https://phish.sinking.yachts/all`, {
        method: "GET",
        headers: {
            "X-Identity": "https://scarletai.xyz"
        }
    });
     
    const listofphishing = await res.json();
    console.log(res.json());
    for (let phishing of listofphishing) {
        if (phishing.domain === domain) {
            detections++;

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
};