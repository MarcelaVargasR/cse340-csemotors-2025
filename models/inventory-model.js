const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* *****************************
 *   Add new vehicle classification
 * *************************** */
async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result.rowCount;
  } catch (error) {
    console.error("Add Classification Error:", error);
    return null;
  }
}

/* ***************************
 *  Get single inventory item and details by inv_id
 * ************************** */
async function getSingleByInventoryId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory
      WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getvehiclesbyid error " + error);
  }
}

/* ******************************
 *  Check for existing classification name
 * ****************************** */
async function checkExistingClass(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1";
    const result = await pool.query(sql, [classification_name]);
    return result.rowCount > 0; // true if exists, false otherwise
  } catch (error) {
    console.error("Error checking existing classification:", error);
    throw error;
  }
}

/* ******************************
 *  Check for existing vehicle data
 * ****************************** */
async function addInventory(
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
) {
  try {
    const sql = `INSERT INTO inventory
    (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image,
     inv_thumbnail, inv_price, inv_miles, inv_color)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`
    const result = await pool.query(sql, [
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
    ])
    return result.rowCount
  } catch (error) {
    console.error("addInventory error", error)
    return null
  }
}


module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  addClassification,
  getSingleByInventoryId,
  checkExistingClass,
  addInventory
};
