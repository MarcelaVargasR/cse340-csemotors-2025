const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build inventory by single view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inventoryId;
  const data = await invModel.getSingleByInventoryId(inv_id);
  const view = await utilities.buildSingleView(data);
  let nav = await utilities.getNav();
  const vehicleName =
    data.inv_year + " " + data.inv_make + " " + data.inv_model;
  res.render("./inventory/single", {
    title: vehicleName,
    nav,
    view,
  });
};

/* ****************************************
 *  Build Management View
 * *************************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  // let manageView = await utilities.buildManagementView();
  // const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Add new classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    message: req.flash("notice"),
  });
};

/* ****************************************
 *  Process New Classification
 * *************************************** */
invCont.addNewClass = async function (req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  const result = await invModel.addClassification(classification_name);

  if (result) {
    req.flash(
      "notice",
      `Successfully added classification "${classification_name}".`
    );
    const newNav = await utilities.getNav();
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav: newNav,
      message: req.flash("notice"),
    });
  } else {
    req.flash("notice", "Failed to add classification.");
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      message: req.flash("notice"),
    });
  }
};

/* ****************************************
 *  Process Vehicle Management
 * *************************************** */
invCont.addVehicle = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    classificationSelect,
    errors: null,
    message: req.flash("notice"),
  })
}

/* ****************************************
 *  Post Vehicle Management
 * *************************************** */
invCont.addNewVehicle = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  const result = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  )

  const nav = await utilities.getNav()

  if (result) {
    req.flash("notice", "Vehicle added successfully.")
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    req.flash("notice", "Vehicle creation failed.")
    res.status(501).render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors: null,
      message: req.flash("notice"),
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
  }
}


module.exports = invCont;
