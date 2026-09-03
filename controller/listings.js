const Listing=require("../models/listing");
const {cloudinary}=require("../cloudconfig.js");
const {geocodeLocation}=require("../utils/geocode.js");

module.exports.index=async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.rendernewform=(req, res) => {
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in to create a listing");
        return res.redirect("/login");
    }
    res.render("listings/new.ejs");
};

module.exports.showlisting=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{
        path:"author",
    }}).populate("owner");
    if (!listing) {
        req.flash("error","Listing you requested does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createlisting=async (req, res) => {
    const newlisting = new Listing(req.body.listing);
    newlisting.owner=req.user._id;
    if (req.file) {
        newlisting.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    
    // Geocode the location and store geometry
    if (newlisting.location && newlisting.country) {
        const geometry = await geocodeLocation(newlisting.location, newlisting.country);
        if (geometry) {
            newlisting.geometry = geometry;
        }
    }
    
    await newlisting.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings");
};

module.exports.rendereditform=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

module.exports.updatelisting=async (req, res) => {
    let { id } = req.params;
    let listingData = req.body.listing;
    let listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }

    if (req.file) {
        // Delete old image from Cloudinary if it exists and is not a default image
        if (listing.image.filename && !listing.image.url.includes("unsplash.com")) {
            await cloudinary.uploader.destroy(listing.image.filename);
        }
        listingData.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    } else if (listingData.image && typeof listingData.image === "string" && listingData.image.trim() !== "") {
        // If a new URL is provided via text input
        listingData.image = {
            url: listingData.image,
            filename: "listingimage"
        };
    }
    
    // Re-geocode if location or country changed
    if (listingData.location || listingData.country) {
        const location = listingData.location || listing.location;
        const country = listingData.country || listing.country;
        const geometry = await geocodeLocation(location, country);
        if (geometry) {
            listingData.geometry = geometry;
        }
    }
    
    const updatedListing = await Listing.findByIdAndUpdate(id, { ...listingData });
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.deletelisting=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    
    // Delete image from Cloudinary if it exists and is not a default image
    if (deletedListing.image.filename && !deletedListing.image.url.includes("unsplash.com")) {
        await cloudinary.uploader.destroy(deletedListing.image.filename);
    }
    
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
};