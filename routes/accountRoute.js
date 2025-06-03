const express = require('express')
const router = new express.Router()
const utilities = require('../utilities/index')
const accountController = require('../controllers/accountController')

// Route to build account view
router.get('/login', utilities.handleErrors(accountController.buildLogin));

// Route to build registration view
router.get('/register', utilities.handleErrors(accountController.buildRegister));

// Route for processing registration without validation, just posts ALL inputs
router.post('/register', utilities.handleErrors(accountController.registerAccount))


// Export the router
module.exports = router;