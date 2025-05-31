// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/index");
const errorController = require("../controllers/errorController");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
//Route to build vehicle detail view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));
// router.get("/inventory/detail/:invId", invController.buildDetailView)
// Intentional 500 error test route
router.get("/trigger-error", utilities.handleErrors(errorController.throwError));


module.exports = router;