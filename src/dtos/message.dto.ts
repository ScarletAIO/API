export type MessageDTO = {
    // Response compliancy DTO
    message: string,
    user?: UserDTO,
    status: number,
    error?: string,
    sentimood?: SentimoodDTO,
    virusTotal?: VirusTotalDTO,
};

export interface UserDTO {
    id: string;
    username: string;
    first_name?: string;
    email?: string;
    password: string;
    permissionFlags: number;
    token?: string; // This will actually be sent with X-Auth-Token
};

export interface VirusTotalDTO {
    data: {
        type: string,
        id: string,
        links: {
            self: string
        },
        attributes: {
            integer_attribute: number,
            string_attribute: string,
            dictionary_attribute: object,
            list_attribute: Array<string>,
        },
        relationships?: object
    }
}

export interface ContextDTO {
    detections: string[] | string,
    confidence: number,
    message_ref: string,
    checkId?: string |  number | null
};

export interface PhishingDTO {
    detections: string[] | number,
    blocked: boolean,
    reason: string,
    domain:string,
    checkedBy: string,
    checkedAt: Date | string,
    error?: string
};

export type SentimoodDTO = {
    score: number,
    comparitive: number,
    words: string[],
    positivity: number,
    negativity: number,
    context?: {
        text: string,
        possibilities: string[],
        keywords: string[],
        sentiment_score: number,
    };
};
