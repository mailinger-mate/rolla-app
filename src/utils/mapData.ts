import { Feature, GeoJsonProperties } from "geojson";

// type Type = 'cellPolygon' | 'cellLabel' | 'marker';

export const Property = {
    AssetsCount: 'assetsCount',
    AssetsMax: 'assetsMax',
    Index: 'index',
    IsLocation: 'isLocation',
    IsAsset: 'isAsset',
    IsStation: 'isMarker',
    Label: 'label',
    Type: 'type',
    Resolution: 'resolution',
    Id: 'id',
} as const;

interface CellLabel {
    [Property.AssetsCount]?: number;
    [Property.AssetsMax]?: number;
    [Property.Resolution]: number;
    [Property.Label]: number | string;
    [Property.Index]: string;
}

interface Polygon {
    type: Type;
}

export interface CellPolygon extends Polygon {
    [Property.AssetsCount]?: number;
    [Property.AssetsMax]?: number;
    [Property.Index]: string;
    // [Property.Resolution]: number;
    [Property.IsAsset]?: boolean;
    [Property.IsLocation]?: boolean;
}

export interface Marker {
    [Property.IsStation]: boolean;
    [Property.Resolution]?: number;
    [Property.Label]?: number;
}

export enum Type {
    StationMarker,
    CellLabel,
    CellPolygon,
};

interface Point {
    [Property.Label]: number | string;
    type: Type;
}

export function setProperty<K extends keyof (CellLabel & CellPolygon)>(
    feature: google.maps.Data.Feature | undefined,
    key: K,
    value: (CellLabel & CellPolygon)[K]
) {
    if (!feature) return;
    feature.setProperty(key, value);
}

export function getProperty<K extends keyof (CellLabel & CellPolygon)>(
    feature: google.maps.Data.Feature,
    key: K,
): (CellLabel & CellPolygon)[K] {
    return feature.getProperty(key);
}

const stationPrefix = 'station:';

export const prefixStationMarker = (
    id: string
): string => {
    return stationPrefix + id; 
}

export const prefixCellLabel = (
    h3Index: string
): string => {
    return h3Index + 'Label';
}

export function point<P extends GeoJsonProperties>(
    id: string,
    [longitude, latitude]: [number, number],
    properties: P,
): Feature {
    return {
        type: 'Feature',
        id,
        geometry: {
            type: 'Point',
            coordinates: [latitude, longitude],
        },
        properties,
    };
}

// export const stationPoint = (
//     id: string,
//     coordinates: [number, number],
//     properties: Exclude<Point, 'type'>,
// ): Feature => {
//     properties.type === Type.Station;
//     return point(id, coordinates, properties);
// }

export function polygon<P extends GeoJsonProperties>(
    id: string,
    coordinates: [number, number][],
    properties: P,
): Feature {
    return {
        type: 'Feature',
        id,
        geometry: {
            type: 'Polygon',
            coordinates: [coordinates],
        },
        properties,
    }
}