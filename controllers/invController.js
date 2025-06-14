const e = require("connect-flash");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  console.log("🚀 ~ data:", data);
  const grid = await utilities.buildClassificationGrid(data, res);
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
  const classificationSelect = await utilities.buildClassificationList();

  res.render("./inventory/management", {
    title: "Vehicle Management",
    classificationSelect,
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
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    classificationSelect,
    errors: null,
    message: req.flash("notice"),
  });
};

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
  } = req.body;

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
  );

  const nav = await utilities.getNav();

  if (result) {
    req.flash("notice", "Vehicle added successfully.");
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    req.flash("notice", "Vehicle creation failed.");
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
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 * Building edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventory_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getSingleByInventoryId(inventory_id);
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

/* ***************************
 * Build delete confirmation view
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getSingleByInventoryId(inv_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  });
};

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id);
  const deleteResult = await invModel.deleteInventoryItem(inv_id);

  if (deleteResult) {
    req.flash("notice", "The inventory item was successfully deleted.");
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, the delete failed.");
    res.redirect(`/inv/delete/${inv_id}`);
  }
};

/* ***************************
 *  Add to Wishlist
 * ************************** */
invCont.addToWishlist = async (req, res) => {
  const invId = parseInt(req.params.invId);
  const accountId = res.locals.accountData.account_id;
  const wasAdded = await invModel.addToWishList(accountId, invId);
  if (!wasAdded) {
    throw new Error("");
  }
  const wishList = await invModel.getWishListByAccountId(accountId);
  const ids = wishList.map(({ inv_id }) => inv_id);
  const data = await invModel.getInventoryByIds([...new Set(ids)]);
  const grid = await utilities.buildClassificationGrid(data, res);
  let nav = await utilities.getNav();
  return res.render("./inventory/wishlist", {
    title: "wishlist",
    nav,
    grid,
    errors: null,
  });
};

/* ***************************
 *  Show Wishlist
 * ************************** */
invCont.showWishList = async (req, res) => {
  let nav = await utilities.getNav();
  const accountId = res.locals.accountData.account_id;
  const wishList = await invModel.getWishListByAccountId(accountId);
  const ids = wishList.map(({ inv_id }) => inv_id);
  const data = await invModel.getInventoryByIds([...new Set(ids)]);
  const grid = await utilities.buildClassificationGrid(data, res);

  return res.render("./inventory/wishlist", {
    title: "wishlist",
    nav,
    grid,
    errors: null,
  });
};

/* ***************************
 *  Remove from Wishlist
 * ************************** */
invCont.removeFromWishlist = async (req, res) => {
  const invId = parseInt(req.params.invId);
  const accountId = res.locals.accountData.account_id;
  const wasNotDeleted = invModel.deleteFromWishlist(accountId, invId);
  if (!wasNotDeleted) {
    throw new Error("");
  }
  const wishList = await invModel.getWishListByAccountId(accountId);
  const ids = wishList.map(({ inv_id }) => inv_id);
  const data = await invModel.getInventoryByIds([...new Set(ids)]);
  const grid = await utilities.buildClassificationGrid(data, res);
  let nav = await utilities.getNav();
  return res.render("./inventory/wishlist", {
    title: "wishlist",
    nav,
    grid,
    errors: null,
  });
};

module.exports = invCont;
