const fs = require('fs')

class FAQService{
    constructor(faqRepo){
        this.FaqRepo = faqRepo;
    }

    async AddNewFAQsToTrainingData(faqs){
        console.log("writing into a file")
        const writeStream = fs.createWriteStream('trainingData.md', { flags: 'a' });
        for (let i = 0; i < faqs.length; i++) { 
            writeStream.write(`### ${faqs[i].FAQ}\n`)
            writeStream.write(`${faqs[i].Response}\n\n`)
        }
        writeStream.close()
    }

    async StoreFAQsToDB(faqs){
        return this.FaqRepo.insertMultipleFAQs(faqs)
    } 

    async GetAllWaitingFAQs(){
        console.log("getting all faqs")
        return this.FaqRepo.GetAllWaitingFAQs();
    }

    async HandleModifiedFAQList(faqs){
        try {
            const selectedFAQs = faqs.filter((faq)=>faq.status === "accepted");
            const notSelectedFAQs = faqs.filter((faq)=>faq.status === "rejected");
            await this.AddNewFAQsToTrainingData(selectedFAQs);
            if(selectedFAQs.length>0) await this.FaqRepo.UpdateFAQsStatusToAccepted({selectedFAQs});
            if(notSelectedFAQs.length>0) await this.FaqRepo.UpdateFAQsStatusToRejected({notSelectedFAQs})

            return {success: true, data: null, error:null}
        } catch (error) {
            console.log('error while handling modified faqs by admin in faq service layer:', error);
            return {success: false, data: null, error}
        }
    }
}

module.exports = {FAQService}