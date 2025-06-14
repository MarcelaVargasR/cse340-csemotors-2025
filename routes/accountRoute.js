const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/index");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// Route to build account view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build registration view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

/* ***********************************
 * Deliver Account Management View
 * ******************************** */
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

/* ***********************************
 * Deliver logout route
 * ******************************** */
router.get("/logout", accountController.logout);

/* ***********************************
 * Update accout route
 * ******************************** */
router.get(
  "/update/:accountId",
  utilities.checkJWTToken,
  utilities.handleErrors(accountController.updateAccount)
);

// // Route for processing registration without validation, just posts ALL inputs
// router.post('/register', utilities.handleErrors(accountController.registerAccount))

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// // Process the login attempt
// router.post("/login", (req, res) => {
//   res.status(200).send("login process");
// });

// Process the login attempt with validation
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

/* ***********************************
 * Update data with validation
 * ******************************** */
router.post(
  "/update",
  utilities.checkJWTToken,
  regValidate.accountUpdateRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.processAccountUpdate)
);

/* ***********************************
 * Update password data with validation
 * ******************************** */
router.post(
  "/update-password",
  utilities.checkJWTToken,
  regValidate.passwordUpdateRules(),
  regValidate.checkPasswordUpdateData,
  utilities.handleErrors(accountController.processPasswordUpdate)
);




// Export the router
module.exports = router;
