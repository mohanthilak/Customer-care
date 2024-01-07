const {model, Schema} = require("mongoose");

const AdminSchema = new Schema ({
    adminID: {
        type: String,
        required: true,
    },
    password: {
        type:String,
        required: true,
    }
})

const AdminModel = model("admin", AdminSchema);
module.exports = {AdminModel};