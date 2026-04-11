const router = require('express').Router()
/**
 * Require Controllers
 */
const userController = require('../controller/user.controller')

/**
 * Require Middlewares
*/

const uploadFile = require('../middlewares/multer.middleware')
const authMiddleware = require('../middlewares/auth.middleware')


/**
 * Create Routes
 */
router.post("/register", uploadFile.fields([{name: "avatar", maxCount: 1},{name: "coverImage", maxCount: 1}]), userController.resisterApi)
router.post("/login", userController.loginApi)


// Secure Route
router.post("/logout", authMiddleware.isLoggedin,  userController.logoutApi)
router.post("/refreshAccessToken", userController.refreshAccessToken)
router.post("/changePassword", authMiddleware.isLoggedin , userController.changeCurrentPassword)
router.post("/getCurrentUser", authMiddleware.isLoggedin , userController.getCurrentUser)
router.post("/updateUserDetails", authMiddleware.isLoggedin , userController.updateUserDetails)

module.exports = router