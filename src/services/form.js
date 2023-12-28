class FormService {
    constructor(formRepo){
        this.formRepo = formRepo;
    }

    async CreateFormDetails({convoID, executiveName, executiveID, customerName, customerEmail, customerQuery, resolved, solution}){
        return this.formRepo.CreateFormDetails({convoID, executiveName, executiveID, customerName, customerEmail, customerQuery, resolved, solution});
    }
}

module.exports = {FormService};