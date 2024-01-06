const {ChatModel} = require("../models/chat");
const {MessageModel} = require("../models/message")

class ChatRepo {
    async CreateConvo({message, socketID}){
        try {
            console.log("\n\n\n\n\n", "!!!!!!!!!!!!!!!!!!!!!");
            const convo = new ChatModel({socketID});
            await convo.save();
            
            return {success: true, data: convo, error: null};
        } catch (error) {
            console.log("error while creating convo in chat repo:", error);
            return {success: false, data: null, error};
        }
    }

    async CreateConvoAndAddMessage({socketID, messageText, handler}){
        try {
            const message = new MessageModel({text:messageText, sentBy:"user", handler})
            await message.save();
            const convo = new ChatModel({socketID});
            convo.messages = [message._id];
            await convo.save();
            return {success: true, data: convo, error: null}
        } catch (error) {
            console.log("error while creating a new chat and adding message to it:", error);
            return {success: false, data: null,error}
        }
    }

    async GetConvo({convoID}){
        try {
            const convo = await ChatModel.findById(convoID);
            if(convo)return {success: convo ? true : false, data: convo, error: convo ? null : "invalid chatID"};
            throw "invalid ConvoID"
        } catch (error) {
            console.log("error while getting convo from chat repo:", error);
            return {success: false, data: null, error}
        }
    }

    async SwitchToExecutive({convoID}){
        try {
            const chat = await ChatModel.findById(convoID).populate("users messages");
            if(!chat) throw "invalid convo ID";
            chat.handler = "executive";
            await chat.save();
            return {success: true, data: chat, error: null};
        } catch (error) {
            console.log("error while swtiching handler to executive:", error);
            return {success: false, data: null, error}
        }
    }
    async RemoveExecutiveSocketIDFromConvo({convoID}){
        try {
            const chat = await ChatModel.findById(convoID);
            if(!chat) throw "invalid convo ID";
            chat.executiveSocketID = null;
            chat.status = "closed"
            await chat.save();
            return {success: true, data: chat, error: null};
        } catch (error) {
            console.log("error while setting executive socketID to null in Convo:", error);
            return {success: false, data: null, error}
        }
    }

    async addMessageToConvo({msg, convoID, sentBy}){
        try {
            const message = new MessageModel({text:msg, sentBy})
            await message.save();
            const convo = await ChatModel.findById(convoID);
            console.log("chat and message from repo", {message, convo})
            if(convo){
                if(convo.messages){
                    convo.messages.push(message._id);
                    await convo.save();
                }else{
                    convo.message = [message._id]
                }
                return {success: true, data: convo, error: null}
            }
            return {success: false, data: null, error: "invalid-id"}
        } catch (error) {
            console.log("Error while adding a message to a conversation in chat repo:", error);
            return {success: false, data: null, error}
        }
    }

    async addMessageAndSocketId({convoID, socketID, messageText}){
        try {
            const chat = await ChatModel.findById(convoID).populate("messages users")
            if(chat){
                const msg = new MessageModel({text: messageText, sentBy: "user"})
                await msg.save();
                chat.socketID = socketID;
                chat.messages.push(msg._id);
                await chat.save()
                chat.messages[chat.messages.length-1] = msg;
                return {success: true, data:chat, error: null};
            }
            return {success: false, data:null, error: "invalid chatID"};
        } catch (error) {
            console.log('error while adding messaeg to db', error);
            return {success: false, data: null, error: error}
        }
    }
    
    async addMessageAndExecutiveSocketId({convoID, socketID, messageText}){
        try {
            const chat = await ChatModel.findById(convoID).populate("messages users")
            if(chat){
                const msg = new MessageModel({text: messageText, sentBy: "executive"})
                await msg.save();
                chat.executiveSocketID = socketID;
                chat.messages.push(msg._id);
                await chat.save()
                chat.messages[chat.messages.length-1] = msg;
                return {success: true, data:chat, error: null};
            }
            return {success: false, data:null, error: "invalid chatID"};
        } catch (error) {
            console.log('error while adding messaeg to db', error);
            return {success: false, data: null, error: error}
        }
    }


    async GetAllUnhandledChatsByExecutives(){
        try {
            const chats = await ChatModel.find({executiveSocketID: null, handler: "executive", status:'waiting'}).populate("messages users").lean();
            return {success: true, data: chats,error: null}
        } catch (error) {
            console.log("error while getting all unhandled chat by executive:", error);
            return {success: false, data: null, error}
        }
    }

    async GetAllChatsWithExecutiveHandler(){
        try {
            const chats = await ChatModel.find({handler: "executive"}).populate("messages users").lean();
            return {success: true, data: chats, error: null}
        } catch (error) {
            console.log("error while getting all unhandled chat by executive:", error);
            return {success: false, data: null, error}
        }
    }

    async removeExecutiveSocketIDAndCloseConversation({socketID}){
        try {
            console.log("\n\nExecutivesocketID:", socketID)
            let executivechats = await ChatModel.updateMany({executiveSocketID: socketID}, {executiveSocketID: null });
            let userChats = await ChatModel.updateMany({socketID}, {status: "closed"})

            return {success:true, data:{executivechats, userChats}, error: null}
        } catch (error) {
            console.log("error while setting executive socket id to null", error)
            return {success:false, data:null, error}
        }
    }
}

module.exports = {ChatRepo}