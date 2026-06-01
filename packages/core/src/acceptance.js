export const acceptanceStatusValues = ["未开始", "开发中", "待验收", "通过", "不通过", "阻塞"];
export function markAcceptance(record, status, evidence) {
    return {
        ...record,
        status,
        evidence: [...record.evidence, evidence]
    };
}
