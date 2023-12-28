const axios = require('axios')
const OAI = require("openai");

const OpenAIKey = "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";
const openai = new OAI({
    apiKey: OpenAIKey,
});
class WebSocket{
    constructor(io, services, key, assistantID){
        this.io = io
        this.services = services;
        this.key = key;
        this.baseURL = "https://api.openai.com/v1";
        this.axiosPrivate = axios.create({
            baseURL: this.baseURL,
            timeout: 1000,
            headers: {Authorization: `Bearer ${this.key}`,"OpenAI-Beta": "assistants=v1"}
        })
        this.assistantID = assistantID;
    }

    /* 
        
    */


    startConnection(){
        this.io.on("connection", (socket)=>{
            console.log('user Connected:', socket.id)
        
            socket.on('disconnect', (reason)=>{
                console.log("user disconnected:", reason)
                this.services.chat.removeExecutiveSocketID({socketID:socket.id})
            })

            socket.on("create-conversation", async()=>{
                const data = await this.services.chat.CreateConvo({socketID: socket.id});
                socket.emit("convo-creted", data.data._id)
            })

            socket.on("switch-to-executive", async (convoID)=>{
                const data = await this.services.chat.SwitchToExecutive({convoID});
                console.log("\n\ndata:", data)
                if(data.success){
                    socket.broadcast.emit('new-customer-for-executive', data.data);
                }
            })
 
            socket.on('executive-sets-close-conversation', async (convoID) =>{
                const data = await this.services.chat.RemoveExecutiveSocketIDFromConvo({convoID})
                // if(data.success){
                //     socket.broadcast.emit("new-customer-for-executive", data.data);
                // }
            })

            socket.on("form-submission", async ({convoID, executiveName, executiveID, customerName, customerEmail, customerQuery, resolved, solution})=>{
                const data = await this.services.form.CreateFormDetails({convoID, executiveName, executiveID, customerName, customerEmail, customerQuery, resolved, solution})
                if(data.success){
                    socket.emit("form-response", data);
                }
            })

            socket.on("load-chats-for-executive", async ()=>{
                const data = await this.services.chat.GetAllChatsWithExecutiveHandler();
                // const data = await this.services.chat.GetAllUnhandledChatsByExecutives();
                if(data.success) socket.emit("convos-for-executive", data.data)
            })

            socket.on("message", async (socketData)=>{
                console.log("\n\nMessage Reveived:", socketData)
                const {message: messageText, threadID, convoID, handler, sentBy} = socketData;

                if(handler === "executive"){
                    let data = null
                    if(sentBy === "executive"){
                        data = await this.services.chat.addMessageAndExecutiveSocketId({convoID,socketID: socket.id, messageText})
                        if(data.success)socket.broadcast.to(data.data.socketID).emit('executive-response', {text: messageText});
                    }else {
                        data = await this.services.chat.addMessageAndSocketId({convoID,socketID: socket.id, messageText})
                        if(data.success)socket.broadcast.emit('user-response', data.data);
                    }
                    
                }else{

                    
                    const data = await this.services.chat.GetConvo({convoID});
                    
                    // Add message to the the conversation and update the socketID if at all the Backend Server restarted(it allocates new socketID to all the clients);
                    await this.services.chat.addMessageAndSocketId({convoID,socketID: socket.id, messageText})
                    
                    //This will be always true, unless the user tampers with the localstorage in the frontend.
                    if(data.success){
                        let runID = null;
                        data.data.socketID = socket.id;
                        if(threadID === "null"){
                            console.log("\n\nThreadID doesn't exists:", threadID)
                            const TID = await this.services.openAI.CreateANewConversation();
                            if(TID){
                                const CreateMessageData = await this.services.openAI.createMessage(TID, messageText);
                                if(CreateMessageData.success){
                                    runID = await this.services.openAI.RunAssitant(TID,convoID);
                                    this.CheckOpenAIAssistantResponseStatus(TID, runID, convoID)
                                }else{
                                    console.log("Unable to Create a new Message")
                                }
                            }else{
                                console.log("Could not create a new thread")
                            }
                        }else{
                            console.log("\n\nThreadID exists:", threadID)
                            await this.services.openAI.createMessage(threadID, messageText);
                            runID = await this.services.openAI.RunAssitant(threadID, convoID);
                            this.CheckOpenAIAssistantResponseStatus(threadID, runID, convoID)
                        }
                        
                    }
                }
            })
        })
    }

    async CheckOpenAIAssistantResponseStatus(threadID, runID, convoID){
        let i = 0
        let intervalID = setInterval(async()=>{
            i++;
            if(i >= 6){
                clearInterval(intervalID);
                return;
            }
            console.log("threadID and runID inside check status:", {threadID, runID})
            try {
                const run = await openai.beta.threads.runs.retrieve(threadID,runID);
                console.log("\n\nstatus:", run?.status)
                if(run?.status == "completed"){
                    console.log("\n\nResponse Created!")
                    const response = await this.services.openAI.GetResponse(threadID)
                    this.sendMessage(convoID, response, "bot", threadID)
                    clearInterval(intervalID);
                }
            } catch (error) {
                console.log("error while requesting status", error);
            }
        }, 5000)
        console.log("Out of setInterval")
    }

    async sendMessage(convoID, message, from, threadID){
        const data = await this.services.chat.addMessageToConvo({msg: message.content[0].text.value,convoID, sentBy: "bot"});
        console.log("\n\nInside the SendMessage Function:", message.content[0].text.value, {data:data})
        if(data.success){
            console.log("message sent to socketID:", data.data.socketID)
            this.io.to(data.data.socketID).emit("query-response", {text: message.content[0].text.value, from, threadID});
        }
    }

    
}

module.exports = {WebSocket};




// await this.axiosPrivate.get(`/threads/${threadID}/runs/${runID}`).then(async (res)=>{
            //     if(res.data.status == "completed"){
            //         console.log("\n\nResponse Created!")
            //         const response = await this.services.openAI.GetResponse(threadID)
            //         this.sendMessage(convoID, response, "bot", threadID)
            //         clearInterval(intervalID);   
            //     }
            // }).catch(e=>{
            //     console.log("error while checking for the status of response", e);
            // })