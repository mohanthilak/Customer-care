const {Schema, model} = require("mongoose");

const formSchema = new Schema({
    converstionID: {
        type: Schema.Types.ObjectId,
        ref: "chat",
    },
    executiveName: {
        type: String,
    },
    executiveID: {
        type: String,
    },
    customerName: {
        type: String,
    },
    customerEmail: {
        type: String,
    },
    customerQuery: {
        type:String,
    },
    resolved: {
        type: Boolean,
    },
    solution: {
        type: String
    }
})

const FormModel = model("form", formSchema);
module.exports = {FormModel}