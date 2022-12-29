const characters = "0123456789abcdefghijklmnopqrstuvwxyz";
const endIndex = characters.length - 1;

export const geohashesBetween = (
    start: string,
    end: string,
) => {
    const geohashes = [start];

    let between = start;
    while (between !== end.replace('~', characters[endIndex])) {
        let betweenCharacters = [];
        let isMax = true;

        for (let index = 0; index < between.length; index++) {
            const character = between[index];
            if (characters.indexOf(character) !== endIndex) isMax = false;
            betweenCharacters.push(character);
        }
        if (isMax) {
            if (between.length < end.length) {
                betweenCharacters = Array.from({ length: between.length + 1 }, () => characters[0]);
            }
            else break;
        }
        for (let index = betweenCharacters.length - 1; index >= 0; index--) {
            const character = between[index];
            const characterIndex = characters.indexOf(character);

            if (characterIndex < endIndex) {
                betweenCharacters[index] = characters[characterIndex + 1];
                break;
            }
            betweenCharacters[index] = characters[0];
        }

        between = betweenCharacters.join("");
        geohashes.push(between);
    }

    return geohashes;
};
