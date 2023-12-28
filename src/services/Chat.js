class ChatService {
    constructor(ChatRepo){
        this.CR = ChatRepo;
    }


    async CreateConvo({ socketID}){
        return this.CR.CreateConvo({ socketID});
    }


    async GetConvo({convoID}){
        return this.CR.GetConvo({convoID});
    }

    async addMessageToConvo({msg, convoID, sentBy}){
        return this.CR.addMessageToConvo({msg, convoID, sentBy})
    }
    async addMessageAndSocketId({convoID, socketID, messageText}){
        return this.CR.addMessageAndSocketId({convoID, socketID, messageText})
    }
    async addMessageAndExecutiveSocketId({convoID, socketID, messageText}){
        return this.CR.addMessageAndExecutiveSocketId({convoID, socketID, messageText})
    }

    async SwitchToExecutive({convoID}){
        return this.CR.SwitchToExecutive({convoID});
    }

    async RemoveExecutiveSocketIDFromConvo({convoID}){
        return this.CR.RemoveExecutiveSocketIDFromConvo({convoID})
    }


    async GetAllUnhandledChatsByExecutives(){
        return this.CR.GetAllUnhandledChatsByExecutives();
    }

    async removeExecutiveSocketID({socketID}){
        return this.CR.removeExecutiveSocketID({socketID})
    }
    async GetAllChatsWithExecutiveHandler(){
        return this.CR.GetAllChatsWithExecutiveHandler()
    }
}

module.exports = {ChatService};