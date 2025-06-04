const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  const listItemHtml = data.rows.map((row) => `
    <li class="nav-item">
      <a
        class="nav-link" href="/inv/type/${row.classification_id}"
        title="See our inventory of ${row.classification_name} vehicles"
      >
        ${row.classification_name}
      </a>
    </li>
  `).join('')
  const listHtml = `
    <ul class="nav-list">
      ${listItemHtml}
    </ul>
  `
  return listHtml
}



/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  if (data.length === 0) {
    return `<p class="notice">Sorry, no matching vehicles could be found.</p>`;
  }

  const listItemsHtml = data.map(vehicle => `
    <li class="vehicle-card">
      <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
        <img class="vehicle-image-thumb" src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
      </a>
      <div class="vehicle-card-info">
        <hr />
        <h2  class="vehicle-title">
          <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            ${vehicle.inv_make} ${vehicle.inv_model}
          </a>
        </h2>
        <span class="vehicle-price">$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
      </div>
    </li>
  `).join('');

  return `
    <ul id="inv-display">
      ${listItemsHtml}
    </ul>
  `;
};



/* **************************************
* Build the single view HTML
* ************************************ */
Util.buildSingleView = async function (data) {

  const view = `
    <div class="vehicle-details-container">
      <h1 class="title-vehicle">${data.inv_model} ${data.inv_make} - ${data.inv_year}</h1>
      <img class="vehicle-image" src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model}">
      <div>
        <h2 class="title-veh-des">${data.inv_model} ${data.inv_make} details:</h2>
      </div>
      <ul class="vehicle-info-list>
        <li class="vehicle-price">
          <h2 class="price">Price: $${Intl.NumberFormat('en-US').format(data.inv_price)}</h2>
        </li>
        <li class="vehicle-description">
          <b>Description</b>: ${data.inv_description}
        </li>
        <li class="vehicle-color">
          <b>Color</b>: ${data.inv_color}
        </li>
        <li class="vehicle-mileage">
          <b>Milage</b>: ${Intl.NumberFormat('en-US').format(data.inv_miles)}
        </li>
      </ul>
    </div>
  `;
  return view;
};



/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)



/* **************************************
 * Build the classification <select> list
 * ************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected"
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

module.exports = Util