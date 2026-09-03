require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const { geocodeLocation } = require("../utils/geocode.js");

async function connectDB() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
        console.log("Connected to MongoDB locally");
    } catch (err) {
        console.log("MongoDB connection error:", err);
        process.exit(1);
    }
}

async function migrateListings() {
    try {
        // Only get listings without geometry or with default [0,0] coordinates
        const listings = await Listing.find({
            $or: [
                { geometry: { $exists: false } },
                { "geometry.coordinates": [0, 0] }
            ]
        });
        
        console.log(`Found ${listings.length} listings to migrate...\n`);

        let updated = 0;
        let failed = 0;
        let skipped = 0;

        for (let i = 0; i < listings.length; i++) {
            const listing = listings[i];
            
            try {
                if (!listing.location || !listing.country) {
                    console.log(`⊘ Skipping: ${listing.title} - missing location/country`);
                    skipped++;
                    continue;
                }

                console.log(`\n[${i+1}/${listings.length}] Geocoding: "${listing.title}"`);
                console.log(`   Location: ${listing.location}, ${listing.country}`);
                
                const geometry = await geocodeLocation(listing.location, listing.country);
                
                if (geometry) {
                    listing.geometry = geometry;
                    await listing.save();
                    updated++;
                    console.log(`   ✅ Success! Coordinates: [${geometry.coordinates[0]}, ${geometry.coordinates[1]}]`);
                } else {
                    failed++;
                    console.log(`   ❌ Failed to find coordinates (will use fallback geocoding on map)`);
                }
            } catch (err) {
                failed++;
                console.error(`   ❌ Error: ${err.message}`);
            }

            // Rate limiting - 5 seconds between each request to avoid API blocking
            if (i < listings.length - 1) {
                console.log(`   ⏳ Waiting 5 seconds before next request...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        console.log(`\n${'='.repeat(50)}`);
        console.log(`✅ Migration Complete!`);
        console.log(`Updated: ${updated}, Failed: ${failed}, Skipped: ${skipped}`);
        console.log(`${'='.repeat(50)}`);
        
        if (failed > 0) {
            console.log(`\n⚠️  ${failed} listings will use fallback geocoding (works fine!)`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error("Migration error:", err);
        process.exit(1);
    }
}

connectDB().then(() => migrateListings());

