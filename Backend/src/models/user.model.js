import mongoose from "mongoose"
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    // email verification status 
    isVerified:{
        type:Boolean,
        default:false
    },
    // email verification token 
    verificationToken:{
        type:String,
        default:null
    },
    verificationTokenExpiry:{
        type:Date,
        default:null
    }
},{timestamps:true

});

const userModel = mongoose.model("User",userSchema)
export default userModel