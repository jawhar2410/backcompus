const express = require("express");
const router = express.Router();
const DevoirController = require("../controllers/Devoir.controller");


router.post("/", DevoirController.CreateDevoir); 
router.put("/:devoirId", DevoirController.UpdateDevoir);
router.delete("/:devoirId", DevoirController.deleteDevoir); 
router.get("/", DevoirController.getAllDevoir);  
router.get("/:devoirId",DevoirController.getDevoirById);
router.get("/classes/:classeId", DevoirController.getDevoirByclasse);
router.get("/prof/:profId", DevoirController.getDevoirByprof);
router.get("/user/token", DevoirController.getDevoirUser);

module.exports = router;