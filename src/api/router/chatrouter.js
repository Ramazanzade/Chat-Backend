const { addMessage, getMessages } = require("../contruler/chatcontruler");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);

module.exports = router;