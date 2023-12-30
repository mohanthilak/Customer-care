const bcrypt = require("bcrypt");

class ExecutiveService {
    whiteListedExecutives = [
        {
            executiveID: "exec1",
            password: "exec1pass"
        },
        {
            executiveID: "exec2",
            password: "exec2pass"
        },
        {
            executiveID: "exec3",
            password: "exec3pass"
        },
        {
            executiveID: "exec4",
            password: "exec4pass"
        },
        {
            executiveID: "exec5",
            password: "exec5pass"
        },
        {
            executiveID: "exec6",
            password: "exec6pass"
        },
        {
            executiveID: "exec7",
            password: "exec7pass"
        },
    ]
    constructor(executiveRepo){
        this.executiveRepo = executiveRepo;
    }


    async ExecutiveLogin({executiveID, password}){
        try {
            const user = await this.executiveRepo.findExeutiveWithExexcutiveID({executiveID});
            if(user.data){
                const temp = await bcrypt.compare(password, user.data.password)
                if(temp){
                    const data = user.data;
                    delete data.password
                    return {success: true, data,error :null}
                }
            }
            throw "invalid executiveID";
        } catch (error) {
            console.log("error while logging in executive at the executive service layer", error);
            return {success: false, data:null,error }
        }
    }
    
    async AddExecutives(){
        this.whiteListedExecutives = await Promise.all(this.whiteListedExecutives.map(async(el)=>{
            const hash = await bcrypt.hash(el.password, 10);
            el.password = hash;
            return el;
        }))
        console.log(this.whiteListedExecutives)
        const addedData = await this.executiveRepo.AddExecutives({executives: this.whiteListedExecutives});
        return addedData;
    }
}

module.exports = {ExecutiveService};