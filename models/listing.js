const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
      set: (value) =>
        value === ""
          ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
          : value,
    },
    filename: {
      type: String,
      default: "listingimage",
    },
  },
  price: Number,
  location: String,
  country: String,
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]  // [longitude, latitude]
    }
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "review"
    }
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
  },
  
});

listingSchema.index({ geometry: "2dsphere" });

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;