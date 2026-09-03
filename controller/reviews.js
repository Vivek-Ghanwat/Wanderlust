const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createreview=async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    const newreview = new Review(req.body.review);
    newreview.author = req.user._id;
    listing.reviews.push(newreview._id);
    await newreview.save();
    await listing.save();
    req.flash("success", "New Review Created");
    console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyreview=async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
};