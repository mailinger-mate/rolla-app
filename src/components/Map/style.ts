import { h3ResolutionLocation } from "../../config";
import { Token } from "../../contexts/Theme";
import { CellProperties } from "./Map";

export const styleMap = (color: (name: Token) => string) => {
    return [
        {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    saturation: 36
                },
                {
                    color: color(Token.MonoLow4)
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
                    color: color(Token.MonoHigh6)
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
                    color: color(Token.MonoHigh5)
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
                    color: color(Token.MonoHigh5)
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
                    color: color(Token.MonoHigh4)
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
                    color: color(Token.MonoHigh4)
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
                    color: color(Token.MonoLow2)
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
                    color: color(Token.MonoHigh6)
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
                    color: color(Token.MonoHigh6)
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
                    color: color(Token.MonoHigh6)
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
                    color: color(Token.MonoHigh6)
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
                    color: color(Token.MonoHigh4)
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
                    color: color(Token.MonoLow1)
                }
            ]
        }
    ]
};

export const cellFillColor = ({
    assetsCount,
    assetsMax,
    isLocation = false,
}: CellProperties) => {
    if (!assetsCount || !assetsMax) return;
    return `hsl(120deg, ${Math.max(Math.round(assetsCount / assetsMax * 100), 10)}%, ${50 + +isLocation * 15}%)`;
};

export const cellFillOpacity = ({
    assetsCount,
    isAggregate
}: CellProperties) => {
    if (!isAggregate) return 0;
    if (assetsCount === 0) return 0.3;
    if (assetsCount) return 0.2;
    return 0;
}

export const cellZIndex = ({
    assetsCount,
    isAsset: isMaxCell,
    isLocation: isLocationCell,
}: CellProperties): number => {
    if (isMaxCell) return 30;
    if (isLocationCell) return 20;
    if (assetsCount) return 10;
    return 1;
}

export const cellStrokeColorToken = ({
    isAsset: isMaxCell,
    isLocation: isLocationCell,
}: CellProperties): Token => {
    if (isMaxCell) return Token.Warning;
    if (isLocationCell) return Token.MonoLow4;
    return Token.MonoHigh3;
}

export const cellStrokeWeight = ({
    resolution,
}: CellProperties): number => {
    if (resolution > h3ResolutionLocation) return 2;
    return 1.5;
}