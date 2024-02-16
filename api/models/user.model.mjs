import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: "https://cdn0.iconfinder.com/data/icons/fintech-solutions-solid-24/24/account_user_profile_person_avatar-512.png"
    }
 }, {timestamps: true}
)

const User = mongoose.model('User', userSchema);

export default User