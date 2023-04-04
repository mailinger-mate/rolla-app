import { locationDecimals } from "../config";
import { Coordinates } from "../contexts/Location";

const roundCoordinate = (
    coordinate: number
): number => {
    return +coordinate.toFixed(locationDecimals);
}

export const roundNewCoordinates = (
    oldCoordinates: Coordinates,
    coordinates?: Coordinates,
): Coordinates | undefined => {
    if (!coordinates) return;
    const [oldLatitude, oldLongitude] = oldCoordinates;
    const [latitude, longitude] = coordinates;
    const roundLatitde = roundCoordinate(latitude);
    const roundLongitude = roundCoordinate(longitude);
    if (roundLatitde === oldLatitude && roundLongitude === oldLongitude) return;
    return [
        roundLatitde,
        roundLongitude,
    ];
}
