const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;
const Schema = mongoose.Schema;

const userschema = new Schema({
    email: {
        type: String,
        required: true,
    },
});

userschema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userschema);