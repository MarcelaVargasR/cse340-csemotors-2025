const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const invModel = require("../models/inventory-model");

/*  **********************************
 *  Add Classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    // valid classification is required
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Please provide a classification name")
      .custom(async (classification_name) => {
        const classExists = await invModel.checkExistingClass(
          classification_name
        );
        if (classExists) {
          throw new Error(
            "This classification already exists. Please try enter a new classification or add vehicle to existing class."
          );
        }
      }),
  ];
};

/* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Add Vehicle Data Validation Rules
 * ********************************* */
validate.addVehicleRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Classification is required."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year")
      .isInt({ min: 1886 })
      .withMessage("Year must be a valid number."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid number."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a number."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
  ];
};

/* ******************************
 * Check data and return errors or continue to add Vehicles
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
  const errors = validationResult(req);
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList(
    req.body.classification_id
  );

  if (!errors.isEmpty()) {
    return res.render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors,
      message: null,
      ...req.body,
    });
  }
  next();
};

/* ******************************
 * Check data and return errors or continue to update vehicle
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;

  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList(
    classification_id
  );

  if (!errors.isEmpty()) {
    return res.render("inventory/edit-inventory", {
      title: "Edit " + inv_make + " " + inv_model,
      nav,
      classificationSelect,
      errors,
      message: null,
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    });
  }
  next();
};

module.exports = validate;
