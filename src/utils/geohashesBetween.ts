import { BASE32 } from "geofire-common";

const endIndex = BASE32.length - 1;

export const geohashesBetween = (
    start: string,
    end: string,
) => {
    const geohashes = [start];

    let geohash = start;
    while (geohash !== end.replace('~', BASE32[endIndex])) {
        let id = [];
        let isMax = true;

        for (let index = 0; index < geohash.length; index++) {
            const digit = geohash[index];
            if (BASE32.indexOf(digit) !== endIndex) isMax = false;
            id.push(digit);
        }
        if (isMax) {
            if (geohash.length < end.length) {
                id = Array.from({ length: geohash.length + 1 }, () => BASE32[0]);
            }
            else break;
        }
        for (let index = id.length - 1; index >= 0; index--) {
            const digit = geohash[index];
            const digitIndex = BASE32.indexOf(digit);

            if (digitIndex < endIndex) {
                id[index] = BASE32[digitIndex + 1];
                break;
            }
            id[index] = BASE32[0];
        }

        geohash = id.join("");
        geohashes.push(geohash);
    }

    return geohashes;
};
