const OAI = require("openai");
const {OPENAI_SECRET_KEY} = require('../config')
const openai = new OAI({
    apiKey: OPENAI_SECRET_KEY,
});


class OpenAI {
    constructor(assistantID, assistantID2){
        this.assistantID = assistantID;
        this.assistantID2 = assistantID2;
    }

    // Every Conversation will have thread
    
    /* 
        WorkFlow:
            1. Create a thread if it doesn't exists.
            2. Add the user's message to that thread.
            3. Run the assistant with the assistantID and threadID(This doesn't respond with the response, but just starts the process. There is another API to generate the response). 
            4. After running the assistant. Send another request for getting the response. You could add a setInterval with a api request to check the status, once the response is created send another request to fetch the response.
    */



    // AKA: Create a Thread 
    async CreateANewConversation(){
        let threadID = null;
        const thread = await openai.beta.threads.create();
        threadID = thread.id;
        console.log("threadID:",threadID)
        return threadID;
    }


    // Adds a message to the given thread 
    async createMessage(threadID, message){
        console.log("threadID", threadID, "message", message)
        
        const messageResponse = await openai.beta.threads.messages.create(
            threadID,
            {
              role: "user",
              content: message
            }
          );
        return {success:true, data:messageResponse, error:null};
    }


    async RunAssitant(threadID, convoID){
        try {
            let runID = null;

            const run = await openai.beta.threads.runs.create(
                threadID,
                { 
                assistant_id: convoID ? this.assistantID : this.assistantID2,
                instructions: convoID ? "Please address the user's needs!" : '',
                }
            );
            console.log("\n\n RUnID:", run.id)
            runID = run.id;
            return runID 
        } catch (error) {
            console.log("error while running the assitant:", error)
        }  
    }



    async GetResponse(threadID){
        const messages = await openai.beta.threads.messages.list(threadID);
        
        if(messages) return messages.data[0]
        else return null
    }

    async CheckStatus(threadID, runID){
        return new Promise((resolve, reject)=>{
            let i = 0;
            let interval = setInterval(async () => {
                try {
                    const run = await openai.beta.threads.runs.retrieve(threadID, runID);
                    console.log("\n\n\n form run status: ", run)
                    if(run?.status === "completed"){
                        console.log("\n\nResponse Created!")
                        resolve({success: true, data: run, error: null});
                        clearInterval(interval);
                    }else if(run?.status === "failed" || i == 5){
                        if(i==5) reject({success: false, data: null, error: "time-out"})
                        else reject({success: false, data: null, error: "rate-limited, please wait for a little longer..."})
                        clearInterval(interval)
                    }
                    i++;
                } catch (error) {
                    reject({success: false, data: null, error})
                }
            }, 5000);
        })
    }

    // async RetrainAssistant({instruction})

    async GetFAQsFromForms(form){
        try {
            console.log({form})
            const threadID = await this.CreateANewConversation();
            await this.createMessage(threadID, form)
            const runID = await this.RunAssitant(threadID, null)
            const status = await this.CheckStatus(threadID, runID)
            if(status.success){
                const response = await this.GetResponse(threadID)
                let responseContent = response.content[0].text.value;
                if(typeof responseContent === 'string'){
                    responseContent = JSON.parse(responseContent);
                }
                console.log("\n\n\n",{responseContent}, "\n\n\n")
                return {success: true, data: responseContent, error: null}
            }

        } catch (error) {
            console.log("error while getting FAQs from Forms:", error);
            return {success: false, data: null, error}
        }
    }
    
}



module.exports = {OpenAI};