// Only the two flags these helpers read. Structural on purpose: both PhoneRecord
// types in the project satisfy it, so neither needs importing here and they can't clash.
type RoleFlags = { isBoss?: unknown; isMiniBoss?: unknown };

// The DB sends 0/1, the form sets true/false, so a row can hold either.
// This is the one place that knows that.
export const isTruthy = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';

export const isBoss = (row: RoleFlags) => isTruthy(row.isBoss);
export const isMiniBoss = (row: RoleFlags) => isTruthy(row.isMiniBoss);

// Boss first, then deputies, then everyone else in the original order.
// Each row keeps its original index, because edits are addressed by it.
// Generic (<T>) so the rows keep their own full type on the way out.
export function sortWithIndices<T extends RoleFlags>(phones: T[]) {
    return phones
        .map((row, originalIndex) => ({ row, originalIndex }))
        .sort((a, b) => {
            // identical comparison order to the old inline sort
            if (isBoss(a.row) !== isBoss(b.row)) return isBoss(a.row) ? -1 : 1;
            if (isMiniBoss(a.row) !== isMiniBoss(b.row)) return isMiniBoss(a.row) ? -1 : 1;
            return a.originalIndex - b.originalIndex;
        });
}