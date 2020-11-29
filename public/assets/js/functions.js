export function emptyFields(object) {
    // check if all object values are filled
    return !Object.values(object).every( x => (x !== null && x !== ""));
}