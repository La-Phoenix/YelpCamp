mapboxgl.accessToken = mapToken;

const defaultCoordinates = [3.898652530270285, 7.444589663262745];  // Fallback to default coordinates if geolocation fails

// Initialize map with default center
const map = new mapboxgl.Map({
    container: 'cluster-map',
    style: 'mapbox://styles/mapbox/light-v10',
    center: defaultCoordinates,
    zoom: 3
});

map.addControl(new mapboxgl.NavigationControl());

// Attempt to get the user's exact location
navigator.geolocation.getCurrentPosition(
    (position) => {
        const userCoordinates = [position.coords.longitude, position.coords.latitude];

        // Update map center to the user's location
        map.setCenter(userCoordinates);
        map.setZoom(12);  // Adjust the zoom level based on your preference

        // Optionally add a marker for the user's location
        new mapboxgl.Marker()
            .setLngLat(userCoordinates)
            .setPopup(new mapboxgl.Popup().setHTML("<h3>Your Location</h3>"))
            .addTo(map);
    },
    (error) => {
        console.error("Error retrieving location:", error);
        // If geolocation fails, map remains at the default coordinates
    },
    { enableHighAccuracy: true }
);

// Map load event
map.on('load', function () {
    // Add GeoJSON data source for campgrounds and clustering functionality
    map.addSource('campgrounds', {
        type: 'geojson',
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14,  // Max zoom level to cluster points
        clusterRadius: 50    // Radius for clustering points
    });

    // Add layer for clustered points (circles)
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#00BCD4',
                10,
                '#2196F3',
                30,
                '#3F51B5'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                15,
                10,
                20,
                30,
                25
            ]
        }
    });

    // Add layer for cluster count (number of points in each cluster)
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    // Add layer for unclustered points
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 4,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // Inspect a cluster on click (expand the cluster when clicked)
    map.on('click', 'clusters', function (e) {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        map.getSource('campgrounds').getClusterExpansionZoom(clusterId, function (err, zoom) {
            if (err) return;

            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
            });
        });
    });

    // Show popup when clicking on unclustered point
    map.on('click', 'unclustered-point', function (e) {
        const { popUpMarkup } = e.features[0].properties;
        const coordinates = e.features[0].geometry.coordinates.slice();

        // Ensure the popup appears over the clicked feature
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(popUpMarkup)
            .addTo(map);
    });

    // Change cursor to pointer when hovering over clusters
    map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Reset cursor when leaving the cluster
    map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
    });
});
