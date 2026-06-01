export type AcceptanceStatus = "未开始" | "开发中" | "待验收" | "通过" | "不通过" | "阻塞";
export type AcceptanceEvidence = {
    kind: "test" | "screenshot" | "api-response" | "file" | "log" | "manual";
    reference: string;
    note: string;
};
export type AcceptanceRecord = {
    id: string;
    requirementRefs: string[];
    title: string;
    standard: string;
    status: AcceptanceStatus;
    evidence: AcceptanceEvidence[];
};
export declare const acceptanceStatusValues: AcceptanceStatus[];
export declare function markAcceptance(record: AcceptanceRecord, status: AcceptanceStatus, evidence: AcceptanceEvidence): AcceptanceRecord;
