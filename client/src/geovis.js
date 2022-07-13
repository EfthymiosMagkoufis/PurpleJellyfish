const displayDataonMap_Cluster = (data) => {
    map.addSource("observations-cluster", {
        type: "geojson",
        data: data,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 40 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.loadImage(
        './img/jellyfish_icon.png',
        (error, image) => {
            if (error) throw error;
            map.addImage('jellyfish', image);
            map.addLayer({
                "id": "unclustered-points",
                "type": "symbol",
                "source": "observations-cluster",
                "filter": ["!has", "point_count"],
                'layout': {
                    'icon-image': 'jellyfish', // reference the image
                    'icon-size': 0.12
                }
            });
        }
    );

    const layers = [
        [20, '#61278d', ],
        [10, '#9a50ac'],
        [0, '#a75fdb']
    ];

    layers.forEach((layer, i) => {
        map.addLayer({
            "id": "cluster-" + i,
            "type": "circle",
            "source": "observations-cluster",
            "paint": {
                'circle-color': [
                    'step', ['get', 'point_count'],
                    '#a75fdb', 10,
                    '#9a50ac', 25,
                    '#800fd7', 50,
                    '#61278d', 100,
                    '#430572'
                ],
                'circle-radius': [
                    'step', ['get', 'point_count'],
                    15, 10,
                    20, 25,
                    25, 50,
                    30, 100,
                    35
                ]

            },
            "filter": i === 0 ? [">=", "point_count", layer[0]] : ["all", [">=", "point_count", layer[0]],
                ["<", "point_count", layers[i - 1][0]]
            ]
        });
    });

    map.addLayer({
        "id": "cluster-count",
        "type": "symbol",
        "source": "observations-cluster",
        "layout": {
            "text-field": "{point_count}",
            "text-font": [
                "DIN Offc Pro Medium",
                "Arial Unicode MS Bold"
            ],
            "text-size": 12,
        },
        "paint": {
            "text-color": "#fff"
        }
    });

    map.on('click', (e) => {
        let features = map.queryRenderedFeatures(e.point, {
            layers: ['unclustered-points']
        });
        map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
        if (!features.length) {
            return;
        }
        let feature = features[0];
        let date = feature.properties.obsDate.split('T');
        date = date[0];
        let popup = new mapboxgl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .setOffset([10, -10])
            .setHTML(`<div class="popup-content"><b><u>${feature.properties.name}</b></u> observed:<br>${feature.properties.comment}<br>Observation Date: ${date}</>`)
            .addTo(map);
    });
}


const displayDataonMap_Heatmap = (data) => {
    // Add a new source from our GeoJSON data and set the
    // 'cluster' option to true.
    map.addSource("observations-heatmap", {
        type: "geojson",
        data: data,
    });


    map.addLayer({
            'id': 'jellyfish-heat',
            'type': 'heatmap',
            'source': 'observations-heatmap',
            'maxzoom': 15,
            'paint': {
                // increase weight as diameter breast height increases
                'heatmap-weight': {
                    'property': 'dbh',
                    'type': 'exponential',
                    'stops': [
                        [1, 0],
                        [62, 1]
                    ]
                },
                // increase intensity as zoom level increases
                'heatmap-intensity': {
                    'stops': [
                        [11, 1],
                        [15, 3]
                    ]
                },
                // use sequential color palette to use exponentially as the weight increases
                'heatmap-color': [
                    'interpolate', ['linear'],
                    ['heatmap-density'],
                    0,'rgba(167, 95, 219, 0)',
                    0.2,'#a75fdb',
                    0.4,'#e6a4f6',
                    0.6,'#800fd7',
                    0.8,'#7930b1'
                ],
                // increase radius as zoom increases
                'heatmap-radius': {
                    'stops': [
                        [11, 15],
                        [15, 20]
                    ]
                },
                // decrease opacity to transition into the circle layer
                'heatmap-opacity': {
                    'default': 1,
                    'stops': [
                        [14, 1],
                        [15, 0]
                    ]
                }
            }
        },
        'waterway-label'
    );


    map.setLayoutProperty('jellyfish-heat', 'visibility', 'none');
}
