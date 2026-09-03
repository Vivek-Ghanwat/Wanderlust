if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingrouter = require("./routes/listing.js");
const reviewrouter = require("./routes/review.js");
const userrouter = require("./routes/user.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localstrategy = require("passport-local");
const user = require("./models/user.js");



const dburl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dburl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsmate);
app.use(express.static(path.join(__dirname, "/public")));

main().then(() => {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});

const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});
store.on("error", (err) => {
    console.log("ERROR in mongo session store", err);
});
const sessionoptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionoptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// app.get("/", (req, res) => {
//     res.send("hi i am root");
// });

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curruser = req.user;
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new user({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });
//     let registereduser = await user.register(fakeUser, "helloworld");
//     res.send(registereduser);
// });

app.use("/listings", listingrouter);
app.use("/listings/:id/reviews", reviewrouter);
app.use("/", userrouter);



app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Internal Server Error" } = err;

    res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("listeining on port  8080");
});