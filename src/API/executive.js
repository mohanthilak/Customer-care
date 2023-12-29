const ExecutiveAPI = (app, executiveService) =>{

    app.post("/zys", (req, res)=>{
        res.send(req.body)
    })
    app.get("/add-executives", async(req, res)=>{
        const data = await executiveService.AddExecutives();
        return res.status(data.success? 200:500).json(data);
    })

    app.post("/executive/login", async (req, res)=>{
        const {executiveID, password} = req.body;
        const data = await executiveService.ExecutiveLogin({executiveID, password})
        return res.status(data.success?200:500).json(data);
    })
}

module.exports = {ExecutiveAPI};