const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isloggedin, isowner, validatelisting } = require("../middleware.js");
const listingcontroller=require("../controller/listings.js");
const multer  = require('multer');
const {storage}=require("../cloudconfig.js");
const upload = multer({ storage });


router.route("/")
.get(wrapAsync(listingcontroller.index))
.post(isloggedin, upload.single("listingimage"), validatelisting, wrapAsync(listingcontroller.createlisting));

// New route
router.get("/new",isloggedin, listingcontroller.rendernewform);


router.route("/:id")
.get(wrapAsync(listingcontroller.showlisting))
.put(isloggedin, upload.single("listingimage"), isowner, validatelisting, wrapAsync(listingcontroller.updatelisting))
.delete(isloggedin,isowner, wrapAsync(listingcontroller.deletelisting));


// Edit route
router.get("/:id/edit",isloggedin, wrapAsync(listingcontroller.rendereditform));

module.exports=router;