const {AdminModel} = require("../models/admin")

class AdminRepository {
    async AddAdmin({admin}){
        try {
            const data = await AdminModel.create(admin);
            return {success: true, data, error: null}
        } catch (error) {
            console.log("error while adding admin to DB", error);
            return {success: false, data: null, error}
        }
    }

    async findAdminWithAdminID({adminID}){
        try {
            const data = await AdminModel.findOne({adminID}).lean();
            return {success: true, data, error: null}
        } catch (error) {
            console.log("error while finding admin with adminID", error);
            return {success: false, data: null, error}
        }
    }
}

module.exports = {AdminRepository}