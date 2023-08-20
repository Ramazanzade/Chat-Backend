const { addMessage, getMessages } = require("../contruler/chatcontruler");
const express = require('express');
const router = express.Router();

router.post("/addmsg", addMessage);
router.get("/getmsg", getMessages);

module.exports = router;