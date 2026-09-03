const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isloggedin, validatereview, isreviewauthor } = require("../middleware.js");
const reviewcontroller=require("../controller/reviews.js");

// Post Review Route
router.post("/", isloggedin, validatereview, wrapAsync(reviewcontroller.createreview));

// Delete Review Route
router.delete("/:reviewId",isloggedin,isreviewauthor, wrapAsync(reviewcontroller.destroyreview));

module.exports = router;
