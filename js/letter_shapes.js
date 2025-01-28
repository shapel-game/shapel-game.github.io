
const smallLetters = `a, c, e, i, m, n, o, r, s, u, v, w, x, z`;
const highLetters = `b, d, f, h, k, l, t`;
const lowLetters = `g, j, p, q, y`;

export const smallList = smallLetters.split(", ");
export const highList = highLetters.split(", ");
export const lowList = lowLetters.split(", ");

let letterShapesDict = {};
let letterShapeCodesDict = {};

for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(97 + i);
    if (smallList.includes(letter)) {
        letterShapesDict[letter] = "small";
        letterShapeCodesDict[letter] = "s";
        continue;
    }
    if (highList.includes(letter)) {
        letterShapesDict[letter] = "high";
        letterShapeCodesDict[letter] = "h";
        continue;
    }
    if (lowList.includes(letter)) {
        letterShapesDict[letter] = "low";
        letterShapeCodesDict[letter] = "p";
        continue;
    }
}

export const letterShapes = letterShapesDict;
export const letterShapeCodes = letterShapeCodesDict;