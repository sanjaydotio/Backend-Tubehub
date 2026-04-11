const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
    subscriptionSchema: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, {timestamps: true})

const subscriptionModel = mongoose.model("subscription", subscriptionSchema)

module.exports = subscriptionModel