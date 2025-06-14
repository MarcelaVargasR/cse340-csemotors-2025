// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/index");
const errorController = require("../controllers/errorController");
const validate = require("../utilities/inv-validation");

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);
//Route to build vehicle detail view
router.get(
  "/detail/:inventoryId",
  utilities.handleErrors(invController.buildByInventoryId)
);
// JSON route to return inventory by classification ID
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// Route to build the edit inventory item view
router.get(
  "/edit/:inventory_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildEditInventoryView)
);

// Intentional 500 error test route
router.get(
  "/trigger-error",
  utilities.handleErrors(errorController.throwError)
);

// GET inventory management view
router.get(
  "/",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildManagementView)
);

// Route to build Add New Classification view
router.get(
  "/add-classification",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildAddClassification)
);

// Route to build Add New Vehicle
router.get(
  "/add-vehicle",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.addVehicle)
);

// Deliver the delete confirmation view
router.get(
  "/delete/:inventory_id",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.buildDeleteInventory)
);

// Process the new classification data
router.post(
  "/add-classification",
  utilities.checkEmployeeOrAdmin,
  validate.classificationRules(),
  validate.checkClassData,
  utilities.handleErrors(invController.addNewClass)
);

// Process the new vehicle data
router.post(
  "/add-vehicle",
  utilities.checkEmployeeOrAdmin,
  validate.addVehicleRules(),
  validate.checkVehicleData,
  utilities.handleErrors(invController.addNewVehicle)
);

// Route to process the update inventory form submission
router.post(
  "/update",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.updateInventory)
);

// Handler delete operation
router.post(
  "/delete",
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.deleteInventoryItem)
);

/* ***************************
 *  Add to Whislist
 * ************************** */
router.get("/wishlist/add/:invId", utilities.checkLogin, invController.addToWishlist);


/* ***************************
 *  Delete from Whislist
 * ************************** */
router.get("/wishlist/remove/:invId", utilities.checkLogin, invController.removeFromWishlist);

module.exports = router;
