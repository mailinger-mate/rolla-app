import { distanceBetween, Geohash, GeohashRange } from "geofire-common";
import { geohashesBetween } from "./geohashesBetween";
import Geohasher from 'latlon-geohash';
import { km } from "./distance";
import { maxCompoundQueryArray } from "../config";

export const sortGeohashes = (
    geohashRanges: GeohashRange[],
    coordinates: [number, number],
    radius: number,
): Geohash[][][] => {
    return geohashRanges.map(([start, end]) => {
        const geohashes = geohashesBetween(start, end);
        const inside: string[] = [];
        const outside: [number, string][] = [];

        geohashes.forEach(geohash => {
            try {
                const { lat, lon } = Geohasher.decode(geohash);
                const distance = distanceBetween(coordinates, [lat, lon]);
                // console.log(geohash, distance, radius * 2 / km, distance < radius * 2 / km)
                if (distance < radius * 2 / km) inside.push(geohash);
                else outside.push([distance, geohash]);
            } catch {
                outside.push([Infinity, geohash]);
            }
        });

        outside.sort(([distance], [nextDistance]) => distance - nextDistance);

        return [outside.reduce((
            outside: string[],
            [_, geohash],
        ) => {
            if (outside.length < maxCompoundQueryArray) outside.push(geohash);
            else inside.push(geohash);
            return outside;
        }, []), inside];
    });
}