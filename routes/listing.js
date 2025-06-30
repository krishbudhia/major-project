const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listing.js");

const validateListing = (req, res, next) => {
  let result = listingSchema.validate(req.body);
  if (result.error) {
    throw new ExpressError(400, result.error);
  } else {
    next();
  }
};

//index route
router.get("/", wrapAsync(listingController.index));

//search
router.get(
  "/search",
  wrapAsync(async (req, res) => {
    const { q } = req.query;

    const searchRegex = new RegExp(q, "i"); // case-insensitive regex
    const allListings = await Listing.find({
      $or: [
        { title: { $regex: searchRegex } },
        { location: { $regex: searchRegex } },
        { country: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
      ],
    });
    if (allListings.length > 0)
      res.render("listings/index.ejs", { allListings });
    else {
      req.flash("error", "Listing you requested for does not exist !!");
      res.redirect("/listings");
    }
  })
);

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//show route
router.get("/:id", wrapAsync(listingController.showListing));

//create route
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.createListing)
);

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

// update
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
);

//delete route
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
);

module.exports = router;
