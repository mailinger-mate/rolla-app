import { locationDecimals } from "../config";
import { Coordinates } from "../contexts/Location";

const roundCoordinate = (
    coordinate: number
): number => {
    return +coordinate.toFixed(locationDecimals);
}

export const roundNewCoordinates = (
    oldCoordinates?: Coordinates,
    coordinates?: Coordinates,
): Coordinates | undefined => {
    if (!coordinates) return;
    const { lat: newLatitude, lng: newLongitude } = coordinates;
    const lat = roundCoordinate(newLatitude);
    const lng = roundCoordinate(newLongitude);
    if (!oldCoordinates || lat !== oldCoordinates.lat || lng !== oldCoordinates.lng) return { lat, lng, };
}
