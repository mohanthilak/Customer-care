class WebSocket{
    constructor(io, services, assistantID){
        this.io = io
        this.services = services;
        this.assistantID = assistantID;
        this.formBatchArray = []
    }



    startConnection(){
        this.io.on("connection", (socket)=>{
            console.log('user Connected:', socket.id)
        
            socket.on('disconnect', (reason)=>{
                console.log("user disconnected:", reason)
                this.services.chat.removeExecutiveSocketIDAndCloseConversation({socketID:socket.id})
                socket.broadcast.emit("user-disconected", socket.id)
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
                
                socket.on("form-submission", async ({convoID, executiveName, executiveID, customerName, customerEmail, customerQuery, resolved, solution, reason})=>{
                    const data = await this.services.form.CreateFormDetails({convoID, executiveName, executiveID, customerName, customerEmail, customerQuery, resolved, solution, reason})
                    if(resolved) this.FormBatching({userQuerySummary: customerQuery, solutionSummary:solution})
                    if(data.success){
                        socket.emit("form-response", data);
                    }
                })
                
                socket.on("load-chats-for-executive", async ()=>{
                    const data = await this.services.chat.GetAllChatsWithExecutiveHandler();
                    console.log("\n\nConvos for executive: ", data.data[0].messages)
                    if(data.success) socket.emit("convos-for-executive", data.data)
                })
            
            socket.on("create-conversation", async()=>{
                const data = await this.services.chat.CreateConvo({socketID: socket.id});
                socket.emit("convo-creted", data.data._id)
            })

            socket.on("create-convo-and-add-message",async (socketData)=>{
                console.log("creating conversation + adding the first message", socketData)
                const {message: messageText, handler} = socketData
                const data = await this.services.chat.CreateConvoAndAddMessage({socketID:socket.id, messageText: messageText, handler})

                socket.emit("convo-creted", data.data._id)

                if(handler === "executive" && data.success) return socket.broadcast.emit('user-response', data.data);

                const TID = await this.services.openAI.CreateANewConversation();
                let runID = null;
                if(TID){
                    const CreateMessageData = await this.services.openAI.createMessage(TID, messageText);
                    if(CreateMessageData.success){
                        runID = await this.services.openAI.RunAssitant(TID,data.data._id);
                        const statusData = await this.CheckOpenAIAssistantResponseStatus(TID, runID, data.data._id)
                        if(statusData?.success){
                            const response = await this.services.openAI.GetResponse(TID)
                            this.sendMessage(data.data._id, response, "bot", TID)
                        }else{
                            socket.emit("response-generation-error",statusData.error)
                            let SecondrunID = await this.services.openAI.RunAssitant(TID, data.data._id)
                            const secondStatusID = await this.CheckOpenAIAssistantResponseStatus(TID, SecondrunID, data.data._id)
                            console.log("secondStatusID: ", secondStatusID);
                            if(secondStatusID?.success){
                                const response = await this.services.openAI.GetResponse(TID)
                                this.sendMessage(data.data._id, response, "bot", TID)
                            }else{
                                socket.emit("query-failed", "response couldn't generated")
                            }
                        }
                    }else{
                        console.log("Unable to Create a new Message")
                    }
                }else{
                    console.log("Could not create a new thread")
                }

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
                                    const statusData = await this.CheckOpenAIAssistantResponseStatus(TID, runID, convoID)
                                    console.log("statusData: ", statusData);
                                    if(statusData?.success){
                                        const response = await this.services.openAI.GetResponse(threadID)
                                        this.sendMessage(convoID, response, "bot", threadID)
                                    }else{
                                        socket.emit("response-generation-error",statusData.error)
                                        SecondrunID = await this.services.openAI.RunAssitant(threadID, convoID)
                                        const secondStatusID = await this.CheckOpenAIAssistantResponseStatus(threadID, runID, convoID)
                                        console.log("secondStatusID: ", secondStatusID);
                                        if(secondStatusID?.success){
                                            const response = await this.services.openAI.GetResponse(threadID)
                                            this.sendMessage(convoID, response, "bot", threadID)
                                        }else{
                                            socket.emit("query-failed", "response couldn't generated")
                                        }
                                    }
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
                            const statusData = await this.CheckOpenAIAssistantResponseStatus(threadID, runID, convoID)
                            console.log("statusData: ", statusData);
                            if(statusData?.success){
                                const response = await this.services.openAI.GetResponse(threadID)
                                this.sendMessage(convoID, response, "bot", threadID)
                            }else{
                                socket.emit("response-generation-error",statusData.error)
                                SecondrunID = await this.services.openAI.RunAssitant(threadID, convoID)
                                const secondStatusID = await this.CheckOpenAIAssistantResponseStatus(threadID, runID, convoID)
                                console.log("secondStatusID: ", secondStatusID);
                                if(secondStatusID?.success){
                                    const response = await this.services.openAI.GetResponse(threadID)
                                    this.sendMessage(convoID, response, "bot", threadID)
                                }else{
                                    socket.emit("query-failed", "response couldn't generated")
                                }
                            }
                        }
                        
                    }
                }
            })
        })
    }

    async CheckOpenAIAssistantResponseStatus(threadID, runID, convoID){
        try {
            const statusInfoFromService = await this.services.openAI.CheckStatus(threadID, runID);
            return statusInfoFromService;
        } catch (error) {
            console.log('error while checking status:', error)
            return error
        }
    }

    async sendMessage(convoID, message, from, threadID){
        const data = await this.services.chat.addMessageToConvo({msg: message.content[0].text.value,convoID, sentBy: "bot"});
        console.log("\n\nInside the SendMessage Function:", message.content[0].text.value, {data:data})
        if(data.success){
            console.log("message sent to socketID:", data.data.socketID)
            this.io.to(data.data.socketID).emit("query-response", {text: message.content[0].text.value, from, threadID});
        }
    }

    async FormBatching(form){
        console.log("\n\nForm For Batching:", form)
        this.formBatchArray.push(form);
        if(this.formBatchArray.length === 1){
            await this.FormBatchProcessing();
            this.formBatchArray = []
        }
    }

    async FormBatchProcessing(){
        let forms = this.formBatchArray;
        let data = null;
        do{
            forms = JSON.stringify(forms)
            data = await this.services.openAI.GetFAQsFromForms(forms);
            console.log("\n\n",{data}, "\n\n")
            if(data.success){
                // this.services.Faq.AddNewFAQsToTrainingData(data.data);
                this.services.Faq.StoreFAQsToDB(data.data);
            }
            return;
        }while(!data?.success)
    }
}

module.exports = {WebSocket};