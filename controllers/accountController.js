const utilities = require("../utilities/index");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    message: req.flash("notice"),
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  //let regView = await utilities.buildRegister()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    message: req.flash("notice"),
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      message: req.flash("notice"),
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration......",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process Login
 * *************************************** */
async function loginAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_email } = req.body;

  // You can replace this with real login logic later
  req.flash("notice", `Login is successful`);
  res.render("account/login", {
    title: "Login",
    nav,
    message: req.flash("notice"),
    errors: null,
  });
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    const doesPasswordMatch = await bcrypt.compare(
      account_password,
      accountData.account_password
    );
    if (doesPasswordMatch) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav();
  const accountData = res.locals.accountData;
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountFirstName: accountData?.account_firstname,
    accountType: accountData?.account_type,
    accountId: accountData?.account_id,
    errors: null,
    message: req.flash("notice"),
  });
}

/* ****************************************
 *  Process Logout
 * *************************************** */
async function logout(req, res) {
  let nav = await utilities.getNav();
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out.");
  res.redirect("/");
}

/* ****************************************
 *  Update Account
 * *************************************** */
async function updateAccount(req, res) {
  const accountId = req.params.accountId;
  const accountData = res.locals.accountData;
  const nav = await utilities.getNav();

  if (parseInt(accountId) !== parseInt(accountData.account_id)) {
    req.flash("notice", "Unauthorized access.");
    return res.redirect("/account");
  }

  res.render("account/update", {
    title: "Update Account",
    nav,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
    message: req.flash("notice"),
    errors: null,
  });
}

/* ****************************************
 *  Process Account Info Update
 * *************************************** */
async function processAccountUpdate(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  const nav = await utilities.getNav();

  try {
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      const updatedAccount = await accountModel.getAccountById(account_id);
      delete updatedAccount.account_password;

      const accessToken = jwt.sign(
        updatedAccount,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );

      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          maxAge: 3600 * 1000,
        });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }

      req.flash("notice", "Account information updated successfully.");
      return res.redirect("/account");
      
    } else {
      req.flash("notice", "Update failed. Please try again.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    console.error("Update error:", error);
    req.flash("notice", "There was an error processing your request.");
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      message: req.flash("notice"),
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    });
  }
}

/* ****************************************
 *  Process Password Update
 * *************************************** */
async function processPasswordUpdate(req, res) {
  const { account_password, account_id } = req.body;
  const nav = await utilities.getNav();

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const result = await accountModel.updatePassword(
      account_id,
      hashedPassword
    );

    if (result) {
      req.flash("notice", "Password updated successfully.");
      return res.redirect("/account");
    } else {
      req.flash("notice", "Password update failed.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    req.flash("notice", "There was an error updating the password.");
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      message: req.flash("notice"),
      account_id,
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  loginAccount,
  accountLogin,
  buildAccountManagement,
  logout,
  updateAccount,
  processAccountUpdate,
  processPasswordUpdate,
};
