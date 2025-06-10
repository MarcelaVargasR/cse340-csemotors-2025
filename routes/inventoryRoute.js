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
  utilities.handleErrors(invController.buildEditInventoryView)
);

// router.get("/inventory/detail/:invId", invController.buildDetailView)
// Intentional 500 error test route
router.get(
  "/trigger-error",
  utilities.handleErrors(errorController.throwError)
);

// GET inventory management view
router.get("/", invController.buildManagementView);
// Route to build Add New Classification view
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);
// Process the new classification data
router.post(
  "/add-classification",
  validate.classificationRules(),
  validate.checkClassData,
  utilities.handleErrors(invController.addNewClass)
);
// Route to build Add New Vehicle
router.get("/add-vehicle", utilities.handleErrors(invController.addVehicle));
// Process the new vehicle data
router.post(
  "/add-vehicle",
  validate.addVehicleRules(),
  validate.checkVehicleData,
  utilities.handleErrors(invController.addNewVehicle)
)


module.exports = router;
