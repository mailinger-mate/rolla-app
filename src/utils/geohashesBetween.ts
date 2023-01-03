import { BASE32 } from "geofire-common";

const endIndex = BASE32.length - 1;

export const geohashesBetween = (
    start: string,
    end: string,
) => {
    const geohashes = [start];

    let between = start;
    while (between !== end.replace('~', BASE32[endIndex])) {
        let betweenCharacters = [];
        let isMax = true;

        for (let index = 0; index < between.length; index++) {
            const character = between[index];
            if (BASE32.indexOf(character) !== endIndex) isMax = false;
            betweenCharacters.push(character);
        }
        if (isMax) {
            if (between.length < end.length) {
                betweenCharacters = Array.from({ length: between.length + 1 }, () => BASE32[0]);
            }
            else break;
        }
        for (let index = betweenCharacters.length - 1; index >= 0; index--) {
            const character = between[index];
            const characterIndex = BASE32.indexOf(character);

            if (characterIndex < endIndex) {
                betweenCharacters[index] = BASE32[characterIndex + 1];
                break;
            }
            betweenCharacters[index] = BASE32[0];
        }

        between = betweenCharacters.join("");
        geohashes.push(between);
    }

    return geohashes;
};
