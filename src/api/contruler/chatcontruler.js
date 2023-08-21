const Messages = require("../../models/chatmodel");
const io = require("./soketcontruler"); 
exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.query; 

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      io.getIO().emit("messages", projectedMessages);
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) {
      io.getIO().emit("message", {
        fromSelf: true,
        message: message,
      });
      io.getIO().to(to).emit("message", {
        fromSelf: false,
        message: message,
      });

      return res.json({ msg: "Message added successfully." });
    } else {
      return res.json({ msg: "Failed to add message to the database" });
    }
  } catch (ex) {
    next(ex);
  }
};