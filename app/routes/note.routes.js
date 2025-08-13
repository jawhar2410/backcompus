// note.routes.js
const express = require("express");
const router = express.Router();
const noteController = require("../controllers/note.controller");

router.post("/", noteController.createNote);
router.get("/:userId", noteController.getAllNotesByUser);
router.get("/note/:id", noteController.getNote);
router.put("/:id", noteController.updateNote);
router.delete("/:id", noteController.deleteNote);
module.exports = router;
