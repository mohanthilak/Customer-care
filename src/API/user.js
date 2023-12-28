const express = require('express');

const UserAPI =  (app,userService) =>{
    
    // To Create an User 
    app.post("/user/create", async (req, res)=>{
        const {username, role} = req.body;
        const data =  await userService.CreateUser({username, role})
        res.status(data.sucsess ? 200 : 500).json(data);
    })

    // Get User with User ID
    app.get("/user/:uid", async (req, res) =>{
        const {uid} = req.params;
        const data = await userService.GetUserByUID({uid});
        res.status(data.sucsess ? 200 : 500).json(data);
    })

    app.get("/user", (req, res)=>{
        res.send();
    })
    
}



module.exports = {UserAPI}