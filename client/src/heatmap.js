const displayDataonMap_Heatmap = (data) => {
  console.log('heatmap run');
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

    // map.on('click', (e) => {
    //     let features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-points'] });
    //     map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
    //     if (!features.length) {
    //         return;
    //     }
    //     let feature = features[0];
    //
    //     // Populate the popup and set its coordinates
    //     // based on the feature found.
    //
    //     let date = feature.properties.date.split('T');
    //     date = date[0];
    //     let popup = new mapboxgl.Popup()
    //         .setLngLat(feature.geometry.coordinates)
    //         .setOffset([10,-10])
    //         .setHTML(`<div class="popup-content"><b><u>${feature.properties.name}</b></u> observed:<br>${feature.properties.comment}<br>Observation Date: ${date}</>`)
    //         .addTo(map);
    // });
}
