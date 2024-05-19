const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const verifyJWT = require("../middleware/verifyJWT");
// Apply verifyJWT middleware to authenticate requests
router.use(verifyJWT);
router.route("/").get(usersController.getAllUsers);

router.use(verifyJWT);
router.get("/", usersController.getAllUsers);
module.exports = router;
