const {ExecutiveModel} =require("../models/executive")
class ExecutiveRepository {
    async AddExecutives({executives}){
        try {
            const data = await ExecutiveModel.create(executives);
            return {success: true, data, error: null}
        } catch (error) {
            console.log("error while adding executives to DB", error);
            return {success: false, data: null, error}
        }
    }

    async findExeutiveWithExexcutiveID({executiveID}){
        try {
            const data = await ExecutiveModel.findOne({executiveID}).lean();
            return {success: true, data, error: null}
        } catch (error) {
            console.log("error while adding executives to DB", error);
            return {success: false, data: null, error}
        }
    }
}

module.exports = {ExecutiveRepository}