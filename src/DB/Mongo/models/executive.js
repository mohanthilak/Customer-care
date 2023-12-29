const {model, Schema} = require("mongoose");

const executiveSchema = new Schema ({
    executiveID: {
        type: String,
        required: true,
    },
    password: {
        type:String,
        required: true,
    }
})

const ExecutiveModel = model("executive", executiveSchema);
module.exports = {ExecutiveModel};