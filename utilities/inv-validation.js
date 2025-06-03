const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")

/*  **********************************
  *  Add Classification Data Validation Rules
  * ********************************* */
validate.addClassRules = () => {
    return [
      // valid classification is required
      body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Please provide a classification name")
      .custom(async (classification_name) => {
        const classExists = await invModel.checkExistingClass(classification_name)
        if (classExists){
            throw new Error("This classification already exists. Please try enter a new classification or add vehicle to existing class.")
        }
      }),
    ]
   }

   /* ******************************
 * Check data and return errors or continue to add classification
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        errors,
        title: "Add New Classification",
        nav,
        classification_name,
      })
      return
    }
    next()
}

module.exports = validate