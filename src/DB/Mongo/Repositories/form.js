const {FormModel} = require("../models/form")

class FormRepo {
    async CreateFormDetails({convoID, executiveName, executiveID, customerName, customerEmail, customerQuery, resolved, solution}){
        try {
            const form = new FormModel({conversationID: convoID, executiveID, executiveName, customerName, customerQuery, customerEmail, resolved, solution});
            await form.save();
            return {success: true, data: form, error: null}
        } catch (error) {
            console.log("error while inserting a form into DB");
            return {success: false, data: null, error}
        }
    }
}

module.exports = {FormRepo}