const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({
    path: "reviews",
    populate: {
      path: "author",
    },
  });
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist !!");
    res.redirect("/listings");
  } else res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  let sameTitle = req.body.listing.title;

  let existingListing = await Listing.findOne({ title: sameTitle });

  if (!existingListing) {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = response.body.features[0].geometry;

    await newListing.save();
    req.flash("success", "New Listing Created !!");
  } else {
    throw new ExpressError(400, "Listing already exists !!");
  }
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist !!");
    res.redirect("/listings");
  } else {
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("upload", "upload/w_250"); // decrease image resolution
    res.render("listings/edit.ejs", { listing, originalImageUrl });
  }
};

module.exports.updateListing = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
  let { id } = req.params;
  const updatedData = { ...req.body.listing };
  // If a new image was uploaded, add it to the update
  if (req.file) {
    updatedData.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }
  updatedData.geometry = response.body.features[0].geometry;
  await Listing.findByIdAndUpdate(id, updatedData);

  req.flash("success", "Listing Updated !!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleated !!");
  res.redirect("/listings");
};
