const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const { listingschema,reviewschema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isloggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirecturl = req.originalUrl;
        req.flash("error", "You must be logged in to perform this action");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveredirecturl = (req, res, next) => {
    if (req.session.redirecturl) {
        res.locals.redirecturl = req.session.redirecturl;
    }
    next();
};

module.exports.isowner = async (req, res, next) => {
    let { id } = req.params;
    let listingData = req.body.listing;

    if (!listingData && req.method !== "DELETE") {
        req.flash("error", "Listing data is missing");
        return res.redirect("/listings");
    }

    let foundListing = await Listing.findById(id);
    if (!foundListing || !foundListing.owner || !foundListing.owner.equals(res.locals.curruser._id)) {
        req.flash("error", "You are not the owner of this Listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validatelisting = (req, res, next) => {
    let { error } = listingschema.validate(req.body);
    if (error) {
        let errormsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errormsg);
    }
    next();
};

module.exports.validatereview = (req, res, next) => {
    let { error } = reviewschema.validate(req.body);
    if (error) {
        let errormsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errormsg);
    }
    next();
};

module.exports.isreviewauthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review you requested does not exist");
        return res.redirect(`/listings/${id}`);
    }

    if (!review.author || !review.author.equals(res.locals.curruser._id)) {
        req.flash("error", "You are not the author of this Review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
