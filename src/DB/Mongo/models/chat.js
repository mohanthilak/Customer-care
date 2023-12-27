const {Schema, model} = require("mongoose");

const chatSchema = new Schema({
    users:[{
        type: Schema.Types.ObjectId,
        ref: "user",
    }],
    messages: [{
        type: Schema.Types.ObjectId,
        ref: "message",
    }],
    threadID:{
        type: String,
    },
    socketID: {
        type: String,
        required: true,
    },
    executiveSocketID: {
        type: String,
    },
    handler:{
        type:String,
        default: "bot",
        enum: ["bot", "executive"],
    },
    status:{
        type:String,
        default: 'waiting',
        enum: ['waiting', "closed"]
    }
})

const ChatModel = model("chat", chatSchema);
module.exports = {ChatModel}