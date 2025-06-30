const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isAuthor } = require("../middleware.js");
const reviewController = require("../controllers/review.js");

const validateReview = (req, res, next) => {
  let result = reviewSchema.validate(req.body);
  if (result.error) {
    throw new ExpressError(400, result.error);
  } else {
    next();
  }
};

//review
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

//delete review route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
