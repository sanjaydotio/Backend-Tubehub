const router = require('express').Router()
/**
 * Require Controllers
 */
const userController = require('../controller/user.controller')

/**
 * Require Middlewares
 */

const uploadFile = require('../middlewares/multer.middleware')


/**
 * Create Routes
 */
router.post("/register", uploadFile.fields([{name: "avatar", maxCount: 1},{name: "coverImage", maxCount: 1}]), userController.resisterApi)


module.exports = router