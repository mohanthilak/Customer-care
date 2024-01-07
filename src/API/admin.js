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
    
    app.get("/add-admins", async(req, res)=>{
        const data = await services.admin.AddAdmin();
        return res.status(data.success? 200:500).json(data);
    })


    app.post("/admin/login", async (req, res)=>{
        const {adminID, password} = await req.body;
        const data = await services.admin.AdminLogin({adminID, password});
        return res.status(data.success?200:500).json(data);
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


    app.post('/admin/faq/accepted', async (req, res)=>{
        try {
            const {faq} = req.body;
            const data = await services.faq.AcceptFaq(faq);
            return res.status(200).json(data);
        } catch (error) {
            console.log('error while handling accepted faq:', error);
            return res.status(500).json({success: false,data: null, error})            
        }
    })
    
    app.post('/admin/faq/rejected', async (req, res)=>{
        try {
            const {faq} = req.body;
            const data = await services.faq.RejectFaq(faq);
            return res.status(200).json(data);
        } catch (error) {
            console.log('error while handling rejectd faq:', error);
            return res.status(500).json({success: false,data: null, error})            
        }
    })
}

module.exports = {AdminAPI}