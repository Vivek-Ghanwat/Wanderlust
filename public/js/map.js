document.addEventListener('DOMContentLoaded', function() {
    if (typeof L === 'undefined') {
        console.error('Leaflet library failed to load');
        return;
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('Map element not found');
        return;
    }

    try {
        const map = L.map('map').setView([20.5937, 78.9629], 5);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        const placeLocation = mapElement.getAttribute('data-location');
        const country = mapElement.getAttribute('data-country');
        const lat = parseFloat(mapElement.getAttribute('data-lat'));
        const lon = parseFloat(mapElement.getAttribute('data-lon'));

        console.log('Map data:', { placeLocation, country, lat, lon });

        // Use stored coordinates if available
        if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
            console.log('Using stored coordinates:', lat, lon);
            
            map.setView([lat, lon], 13);
            
            L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`<b>${placeLocation}</b><br>${country}`)
                .openPopup();
        } else {
            // Fallback to geocoding if no coordinates stored (for old listings)
            console.log('No stored coordinates, geocoding...');
            const searchQuery = `${placeLocation}, ${country}`;

            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Geocoding results:', data);
                    if (data.length > 0) {
                        const result = data[0];
                        const lat = parseFloat(result.lat);
                        const lon = parseFloat(result.lon);
                        
                        console.log('Found coordinates:', lat, lon);
                        
                        map.setView([lat, lon], 13);
                        
                        L.marker([lat, lon])
                            .addTo(map)
                            .bindPopup(`<b>${placeLocation}</b><br>${country}`)
                            .openPopup();
                    } else {
                        console.warn("Location not found on map. Search query:", searchQuery);
                    }
                })
                .catch(error => {
                    console.error("Error fetching location:", error);
                });
        }
    } catch (error) {
        console.error('Error initializing map:', error);
    }
});

