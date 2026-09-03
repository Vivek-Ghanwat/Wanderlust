const user = require("../models/user.js");

module.exports.rendersignupform=(req, res) => {
    res.render("users/signup.ejs");
};


module.exports.signup=async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newuser = new user({ email, username });
        const registereduser = await user.register(newuser, password);
        console.log(registereduser);
        req.login(registereduser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderloginform=(req, res) => {
    res.render("users/login.ejs");
}

module.exports.login=async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirecturl = res.locals.redirecturl || "/listings";
    res.redirect(redirecturl);
};

module.exports.logout=(req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        }
        req.flash("success", "You are logged out now");
        res.redirect("/listings");
    });
};