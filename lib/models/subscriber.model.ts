import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
    email: {type: String, required: true, },
    refreshToken: {type: String, required: true},
})

const Subscriber = mongoose.models.User || mongoose.model('User', subscriberSchema);

export default Subscriber;