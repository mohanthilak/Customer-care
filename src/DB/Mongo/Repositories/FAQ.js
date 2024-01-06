const {FAQModel} = require("../models/FAQ")

class FAQRepo{
    async insertMultipleFAQs(FAQs){
        try {
            const insertedData = await FAQModel.create(FAQs);
            return {success: true, data: insertedData, error:null}
        } catch (error) {
            console.log("error while inserting multiple FAQs", error);
            return {success: false, data: null, error}        
        }
    }

    async GetAllWaitingFAQs(){
        try {
            const faqs = await FAQModel.find({status:"waiting"})
            return {success: true, data:faqs, error: null}
        } catch (error) {
            console.log("error while fetching waiting faqs from DB:", error);
            return {success: false, data: null, error}
        }
    }

    async UpdateFAQsStatusToAccepted({selectedFAQs}){
        try {
            const ids = selectedFAQs.map((el)=>el._id)
            console.log(ids)
            const data = await FAQModel.updateMany({_id: {$in: [...ids]}},  {status: "accepted"})
            console.log("accepted Data:", data)
            return {success: true, data, error: null}
        } catch (error) {
            console.log("error while setting accepted state to faqs in faq Repo layer:", error);
            return {success: false, data:null, error}
        }
    }
    
    async UpdateFAQsStatusToRejected({notSelectedFAQs}){
        try {
            const ids = notSelectedFAQs.map((el)=>el._id)
            const data = await FAQModel.updateMany({_id: {$in: ids}},  {status: "rejected"})
            console.log("accepted Data:", data)
            return {success: true, data, error: null}
        } catch (error) {
            console.log("error while setting accepted state to faqs:", faqs);
            return {success: false, data:null, error}
        }
    }
}

module.exports = {FAQRepo};