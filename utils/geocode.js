async function geocodeLocation(location, country) {
    try {
        const searchQuery = `${location}, ${country}`;
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
            {
                headers: {
                    'User-Agent': 'Wanderlust-App/1.0'
                }
            }
        );
        
        if (!response.ok) {
            console.warn(`Geocoding API returned status ${response.status}`);
            return null;
        }
        
        const data = await response.json();
        
        if (data.length > 0) {
            const result = data[0];
            return {
                type: 'Point',
                coordinates: [parseFloat(result.lon), parseFloat(result.lat)]
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return null;
    }
}

module.exports = { geocodeLocation };
