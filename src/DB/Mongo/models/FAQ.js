const {model, Schema} = require('mongoose')

const FAQSchema = new Schema({
    FAQ:{
        type: String,
        required: true,
    },
    Response:{
        type: String,
        required: true,
    },
    status: {
        type: String,
        default:"waiting",
        enum:['waiting','rejected', 'accepted']
    },
    forms: [{
        type: Schema.Types.ObjectId,
        ref: "form",
    }]
})

const FAQModel = model('faq', FAQSchema)
module.exports = {FAQModel};
