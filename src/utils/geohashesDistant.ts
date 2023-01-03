import { distanceBetween, Geohash, GeohashRange } from "geofire-common";
import { geohashesBetween } from "./geohashesBetween";
import Geohasher from 'latlon-geohash';
import { km } from "./distance";
import { maxCompoundQueryArray } from "../config";

export const geohashesDistant = (
    geohashRanges: GeohashRange[],
    coordinates: [number, number],
    radius: number,
): Geohash[][] => {
    return geohashRanges.map(([start, end]) => {
        const geohashes = geohashesBetween(start, end);
        const invalid: [string, number][] = [];

        geohashes.forEach(geohash => {
            try {
                const { lat, lon } = Geohasher.decode(geohash);
                const distance = distanceBetween(coordinates, [lat, lon]);
                if (distance < radius * 2 / km) return;
                invalid.push([geohash, distance]);
            } catch {
                invalid.push([geohash, Infinity]);
            }
        });

        invalid.sort((a, b) => a[1] - b[1]);

        return invalid.reduce((
            exclude: string[],
            [geohash],
        ) => {
            if (exclude.length < maxCompoundQueryArray) exclude.push(geohash);
            return exclude;
        }, []);
    });
}