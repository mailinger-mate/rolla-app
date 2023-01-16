export const high1 = (prefersDark = false) => prefersDark ? '#333333' : '#ffffff';
export const high2 = (prefersDark = false) => prefersDark ? '#353535' : '#fefefe';
export const high3 = (prefersDark = false) => prefersDark ? '#3c3c3c' : '#f5f5f5';
export const high4 = (prefersDark = false) => prefersDark ? '#3e3e3e' : '#f2f2f2';
export const high5 = (prefersDark = false) => prefersDark ? '#696969' : '#ededed';
export const high6 = (prefersDark = false) => prefersDark ? '#545454' : '#dedede';
export const low = (prefersDark = false) => prefersDark ? '#dddddd' : '#333333';
export const warning = () => '#ff6347';

export const styleMap = (prefersDark = false) => {
    return [
        {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    saturation: 36
                },
                {
                    color: low(prefersDark)
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
                    color: high1(prefersDark)
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
                    color: high2(prefersDark)
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
                    color: high2(prefersDark)
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
                    color: high3(prefersDark)
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
                    color: high3(prefersDark)
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
                    color: high6(prefersDark)
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
                    color: high1(prefersDark)
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
                    color: high1(prefersDark)
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
                    color: high1(prefersDark)
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
                    color: high1(prefersDark)
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
                    color: high4(prefersDark)
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
                    color: high5(prefersDark)
                }
            ]
        }
    ]
};

const styleO = [
    // {
    //     featureType: 'water',
    //     elementType: 'geometry',
    //     stylers: [
    //         {
    //             color: '#193341'
    //         }
    //     ]
    // },
    // {
    //     featureType: 'landscape',
    //     elementType: 'geometry',
    //     stylers: [
    //         {
    //             color: '#2c5a71'
    //         }
    //     ]
    // },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
            // {
            //     color: '#29768a'
            // },
            // {
            //     lightness: -37
            // }
            {
                lightness: -7
            }
        ]
    },
    // {
    //     featureType: 'poi',
    //     elementType: 'geometry',
    //     stylers: [
    //         {
    //             color: '#406d80'
    //         }
    //     ]
    // },
    // {
    //     featureType: 'transit',
    //     elementType: 'geometry',
    //     stylers: [
    //         {
    //             color: '#406d80'
    //         }
    //     ]
    // },
    {
        elementType: 'labels.text.stroke',
        stylers: [
            {
                visibility: 'on'
            },
            // {
            //     color: '#3e606f'
            // },
            {
                weight: 2
            },
            {
                gamma: 0.84
            }
        ]
    },
    // {
    //     elementType: 'labels.text.fill',
    //     stylers: [
    //         {
    //             color: high(prefersDark)
    //         }
    //     ]
    // },
    {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [
            {
                weight: 0.6
            },
            // {
            //     color: '#1a3541'
            // }
        ]
    },
    {
        elementType: 'labels',
        stylers: [
            {
                visibility: 'off'
            }
        ]
    },
    {
        elementType: 'labels.icon',
        stylers: [
            {
                visibility: 'off'
            }
        ]
    },
    // {
    //     featureType: 'poi.park',
    //     elementType: 'geometry',
    //     stylers: [
    //         {
    //             color: '#2c5a71'
    //         }
    //     ]
    // }
];