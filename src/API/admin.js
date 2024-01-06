const AdminAPI = (app, services) =>{

    app.get("/admin/faq/all-waiting", async (req, res)=>{
        try {
            const data = await services.faq.GetAllWaitingFAQs();
            console.log(data)
            return res.status(200).json(data)
        } catch (error) {
            console.log('error while handling get all waiting faqs:', error);
            return res.status(500).json({success: false,data: null, error})
        }
    })


    app.post("/admin/faq/selected-faqs", async (req, res)=>{
        try {
            const {faqs} = req.body;
            const data = await services.faq.HandleModifiedFAQList(faqs)
            return res.status(200).json(data)
        } catch (error) {
            console.log('error while handling get all waiting faqs:', error);
            return res.status(500).json({success: false,data: null, error})
        }
    })
}

module.exports = {AdminAPI}