import { h3ResolutionLocation } from "../../config";
import { Token, ColorTheme } from "../../theme/theme";
import { hexToHSL } from "../../utils/hexHsl";
import { getProperty, Property } from "../../utils/mapData";

export const styleMap = (color: ColorTheme) => {
    return [
        {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    saturation: 36
                },
                {
                    color: color[Token.MonoLow4]
                },
                {
                    lightness: 40
                }
            ]
        },
        {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [
                {
                    visibility: 'on'
                },
                {
                    color: color[Token.MonoHigh6]
                },
                {
                    lightness: 16
                }
            ]
        },
        {
            featureType: 'all',
            elementType: 'labels.icon',
            stylers: [
                {
                    visibility: 'off'
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'geometry.fill',
            stylers: [
                {
                    color: color[Token.MonoHigh5]
                },
                {
                    lightness: 20
                }
            ]
        },
        {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: color[Token.MonoHigh5]
                },
                {
                    lightness: 17
                },
                {
                    weight: 1.2
                }
            ]
        },
        {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [
                {
                    color: color[Token.MonoHigh4]
                },
                {
                    lightness: 20
                }
            ]
        },
        {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
                {
                    color: color[Token.MonoHigh4]
                },
                {
                    lightness: 21
                }
            ]
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [
                {
                    color: color[Token.MonoLow2]
                },
                {
                    lightness: 21
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
                {
                    color: color[Token.MonoHigh6]
                },
                {
                    lightness: 17
                }
            ]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
                {
                    color: color[Token.MonoHigh6]
                },
                {
                    lightness: 29
                },
                {
                    weight: 0.2
                }
            ]
        },
        {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [
                {
                    color: color[Token.MonoHigh6]
                },
                {
                    lightness: 18
                }
            ]
        },
        {
            featureType: 'road.local',
            elementType: 'geometry',
            stylers: [
                {
                    color: color[Token.MonoHigh6]
                },
                {
                    lightness: 16
                }
            ]
        },
        {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [
                {
                    color: color[Token.MonoHigh4]
                },
                {
                    lightness: 19
                }
            ]
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [
                {
                    color: color[Token.MonoLow1]
                }
            ]
        }
    ]
};

export const cellFillColor = (
    assetsCount?: number,
    assetsMax?: number,
    isLocation = false,
) => {
    if (!assetsCount || !assetsMax) return;
    return `hsl(120deg, ${Math.max(Math.round(assetsCount / assetsMax * 100), 10)}%, ${50 + +isLocation * 15}%)`;
};

export const cellFillOpacity = (
    assetsCount?: number,
    isAggregate?: boolean,
) => {
    if (!isAggregate) return 0;
    if (assetsCount === 0) return 0.3;
    if (assetsCount) return 0.2;
    return 0;
}

export const cellZIndex = (
    assetsCount?: number,
    isAsset?: boolean,
    isLocation?: boolean,
): number => {
    if (isAsset) return 30;
    if (isLocation) return 20;
    if (assetsCount) return 10;
    return 1;
}

export const cellStrokeColorToken = (
    isAsset?: boolean,
    isLocation?: boolean,
): Token => {
    if (isAsset) return Token.Warning;
    if (isLocation) return Token.MonoLow4;
    return Token.MonoHigh3;
}

export const cellStrokeWeight = (
    resolution: number,
): number => {
    if (resolution > h3ResolutionLocation) return 2;
    return 1.5;
}

export const styleMarker = (
    label: string | number,
    color: ColorTheme,
): google.maps.Data.StyleOptions => {
    return {
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            strokeOpacity: 0,
            fillOpacity: 1,
            fillColor: color[Token.Primary],
            scale: 10,
        },
        label: {
            text: '' + label,
        },
        opacity: 1,
    }
}

export const styleCellLabel = (
    label: string | number,
    color: ColorTheme,
): google.maps.Data.StyleOptions => {
    return {
        // icon: isMarker ? pinSymbol(Point, true) : noSymbol,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            strokeOpacity: 0,
            fillOpacity: 0,
        },
        label: {
            text: '' + label,
            color: color[Token.MonoLow4],
            className: 'cellLabel',
            fontSize: '2.5vmin',
        },
        opacity: label !== null ? 1 : 0,
        zIndex: 5,
    };
}

export const styleCell = (
    feature: google.maps.Data.Feature,
    color: ColorTheme,
): google.maps.Data.StyleOptions => {

    const assetsCount = getProperty(feature, Property.AssetsCount);
    const assetsMax = getProperty(feature, Property.AssetsMax);
    const isAsset = getProperty(feature, Property.IsAsset);
    const isLocation = getProperty(feature, Property.IsLocation);
    const resolution = getProperty(feature, Property.Resolution);
    const isAggregate = resolution <= h3ResolutionLocation;

    const fillColor = cellFillColor(assetsCount, assetsMax, isLocation);

    return {
        strokeColor: !isAggregate && fillColor || color[cellStrokeColorToken(isAsset, isLocation)],
        strokeWeight: cellStrokeWeight(resolution),
        strokeOpacity: 0.5,
        fillOpacity: cellFillOpacity(assetsCount, isAggregate),
        fillColor: fillColor || color[Token.MonoLow2],
        zIndex: cellZIndex(assetsCount, isAsset, isLocation),
    };
}