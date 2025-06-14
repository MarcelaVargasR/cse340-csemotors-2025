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
    const sql = `
      SELECT 
      i.*, 
      c.classification_name,
      CASE 
      WHEN w.inv_id IS NOT NULL THEN true 
      ELSE false 
      END AS is_in_wishlist
      FROM 
      public.inventory AS i
      JOIN 
      public.classification AS c 
      ON i.classification_id = c.classification_id
      LEFT JOIN 
      public.wishlist AS w 
      ON i.inv_id = w.inv_id
      WHERE 
      i.classification_id = $1;
    `;
    const data = await pool.query(sql, [classification_id]);
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

async function getInventoryByIds(_ids) {
  const ids = _ids.map((_, index) => `$${index + 1}`).join(", ");
  try {
    const sql = `
      SELECT * FROM inventory
      WHERE inv_id IN(${ids})
    `;
    const data = await pool.query(sql, _ids);
    return data.rows;
  } catch (error) {
    console.error("Error while getting inventory by Id's");
    return [];
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
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;
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
    ]);
    return result.rowCount;
  } catch (error) {
    console.error("addInventory error", error);
    return null;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql = `
      UPDATE public.inventory 
      SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, 
          inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, 
          inv_color = $9, classification_id = $10
      WHERE inv_id = $11
      RETURNING *;
    `;
    const data = await pool.query(sql, [
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
      inv_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("updateInventory error", error);
    return null;
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    new Error("Delete Inventory Error");
  }
}

/* ***************************
 *  whislist model
 * ************************** */
async function addToWishList(accountId, invId) {
  try {
    const wishList = await getWishListByAccountId(accountId);
    const isItemInWishList = wishList.filter((item) => {
      return item.inv_id === invId;
    });
    if (isItemInWishList.length) {
      throw new Error("Item already in list");
    }
    const sql = `
      INSERT INTO wishlist
      (account_id, inv_id)
      VALUES
      ($1, $2)
    `;
    await pool.query(sql, [accountId, invId]);
    return true;
  } catch (error) {
    console.error("Error while adding to wishlist", error);
    return false;
  }
}

async function getWishListByAccountId(accountId) {
  try {
    const sql = `
      SELECT * FROM wishlist
      WHERE account_id = $1
    `;
    const result = await pool.query(sql, [accountId]);
    return result.rows;
  } catch (error) {
    console.error("Error while getting the wishlist", error);
    return null;
  }
}

async function deleteFromWishlist(accountId, invId) {
  try {
    const sql = `
      DELETE FROM wishlist 
      WHERE account_id = $1 AND inv_id = $2;
    `;
    await pool.query(sql, [accountId, invId]);
    return true;
  } catch (error) {
    console.error("Error while delete item from wishlist", error);
    return false;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  addClassification,
  getSingleByInventoryId,
  checkExistingClass,
  addInventory,
  updateInventory,
  deleteInventoryItem,
  addToWishList,
  getInventoryByIds,
  getWishListByAccountId,
  deleteFromWishlist
};
