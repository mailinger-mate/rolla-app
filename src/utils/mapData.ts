import { Feature } from "geojson";

export const Property = {
    AssetsCount: 'assetsCount',
    AssetsMax: 'assetsMax',
    Index: 'index',
    IsLocation: 'isLocation',
    IsAsset: 'isAsset',
    IsMarker: 'isMarker',
    Label: 'label',
    Resolution: 'resolution',
} as const;

interface CellLabel {
    [Property.AssetsCount]?: number;
    [Property.AssetsMax]?: number;
    [Property.Resolution]: number;
    [Property.Label]: number | string;
    [Property.Index]: string;
}

interface CellPolygon {
    [Property.AssetsCount]?: number;
    [Property.AssetsMax]?: number;
    [Property.Index]: string;
    [Property.Resolution]: number;
    [Property.IsAsset]?: boolean;
    [Property.IsLocation]?: boolean;
}

interface Marker {
    [Property.IsMarker]: boolean;
    [Property.Resolution]: number;
    [Property.Label]: number;
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

export function cellLabel<P extends (CellLabel | Marker)>(
    [longitude, latitude]: [number, number],
    properties: P,
): Feature {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [latitude, longitude],
        },
        properties,
    };
}

export const cellPolygon = (
    id: string,
    coordinates: [number, number][],
    properties: CellPolygon,
): Feature => {
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