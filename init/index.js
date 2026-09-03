const mongoose = require("mongoose");
const initdata = require("./data.js");
const listing = require("../models/listing.js");

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initdb = async () => {
    try {
        const ownerId = new mongoose.Types.ObjectId("6a92717e3330be908e08ad29");
        const listingsWithOwner = initdata.data.map((obj) => ({
            ...obj,
            owner: ownerId,
        }));

        await listing.deleteMany({});
        await listing.insertMany(listingsWithOwner);
        console.log("data was initialized");
    } catch (err) {
        console.error("Error inserting data:", err);
    }
};

main()
    .then(async () => {
        console.log("connected to db");
        await initdb();
        await mongoose.disconnect();
        console.log("connection closed");
    })
    .catch((err) => {
        console.log("Connection error:", err);
    });