const bcrypt = require("bcrypt");

class AdminServices {
    whiteListedAdmin = [
        {
            adminID: "admin1",
            password: "admin1pass"
        },
    ]
    constructor(AdminRepo){
        this.adminRepo = AdminRepo;
    }

    async AdminLogin({adminID, password}){
        try {
            console.log(adminID, password)
            const admin = await this.adminRepo.findAdminWithAdminID({adminID});
            if(admin.data){
                const temp = await bcrypt.compare(password, admin.data.password)
                if(temp){
                    const data = admin.data;
                    delete data.password
                    return {success: true, data,error :null}
                }
            }
            throw "invalid adminID";
        } catch (error) {
            console.log("error while logging in admin at the admin service layer", error);
            return {success: false, data:null,error }
        }
    }
    
    async AddAdmin(){
        this.whiteListedAdmin = await Promise.all(this.whiteListedAdmin.map(async(el)=>{
            const hash = await bcrypt.hash(el.password, 10);
            el.password = hash;
            return el;
        }))
        console.log(this.whiteListedAdmin)
        const addedData = await this.adminRepo.AddAdmin({admin: this.whiteListedAdmin});
        return addedData;
    }

}

module.exports = {AdminServices}