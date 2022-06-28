const displayDataonMap_Cluster = (data) => {

    // Add a new source from our GeoJSON data and set the
    // 'cluster' option to true.
    map.addSource("observations-cluster", {
        type: "geojson",
        data: data,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 40 // Radius of each cluster when clustering points (defaults to 50)
    });


    // Use the earthquakes source to create five layers:
    // One for unclustered points, three for each cluster category,
    // and one for cluster labels.
    map.loadImage(
        './img/jellyfish_icon.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.addImage('jellyfish', image);

            // Add a data source containing one point feature.
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
    )

    // Display the earthquake data in three layers, each filtered to a range of
    // count values. Each range gets a different fill color.
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

    // Add a layer for the clusters' count labels
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

        // Populate the popup and set its coordinates
        // based on the feature found.

        let date = feature.properties.obsDate.split('T');
        date = date[0];
        let popup = new mapboxgl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .setOffset([10, -10])
            .setHTML(`<div class="popup-content"><b><u>${feature.properties.name}</b></u> observed:<br>${feature.properties.comment}<br>Observation Date: ${date}</>`)
            .addTo(map);
    });
}


//--------------------
