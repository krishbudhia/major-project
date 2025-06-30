const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registerdUser = await User.register(newUser, password); //async function so we have to use await
    req.login(registerdUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderhaven!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Wanderhaven!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!!");
    res.redirect("/listings");
  });
};

module.exports.renderForgotForm = (req, res) => {
  res.render("users/forgot.ejs");
};

module.exports.forgot = async (req, res, next) => {
  const { email, newpassword, cnfpassword } = req.body;
  if (newpassword !== cnfpassword) {
    req.flash("error", "Password do not match!");
    return res.redirect("/forgot");
  }

  const user = await User.findOne({ email });
  if (!user) {
    req.flash("error", "No account found with that email!");
    return res.redirect("/forgot");
  }

  user.setPassword(newpassword, async (err) => {
    if (err) {
      return next(err);
    }

    await user.save();
    req.flash("success", "Password successfully reset! You can now log in!");
    res.redirect("/login");
  });
};
