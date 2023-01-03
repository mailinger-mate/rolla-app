

export const styleMap = (prefersDark = false) => {
    const high1 = prefersDark ? '#333333' : '#ffffff';
    const high2 = prefersDark ? '#353535' : '#fefefe';
    const high3 = prefersDark ? '#3c3c3c' : '#f5f5f5';
    const high4 = prefersDark ? '#3e3e3e' : '#f2f2f2';
    const high5 = prefersDark ? '#4a4a4a' : '#e9e9e9';
    const high6 = prefersDark ? '#545454' : '#dedede';
    const low = prefersDark ? '#dddddd' : '#333333';
    return [
        {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [
                {
                    saturation: 36
                },
                {
                    color: low
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
                    color: high1
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
                    color: high2
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
                    color: high2
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
                    color: high3
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
                    color: high3
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
                    color: high6
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
                    color: high1
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
                    color: high1
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
                    color: high1
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
                    color: high1
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
                    color: high4
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
                    color: high5
                },
                {
                    lightness: 17
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
    //             color: high
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