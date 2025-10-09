const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:String,
        default:Date.now(),
        expires:5*60,
    }

});

// creating a function -> to send emails
async function sendVerificationEmail(email,otp) {
    try{
        const mailResponse = await mailSender(email, "Verification Email from Learnora" , otp);
        console.log("Email sent successfully : " , mailResponse);

    } catch(error) {
        console.log("Error occured while sending mails : ", error);
        throw error;
    }
}

OTPSchema.pre("save" , async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model("OTP",OTPSchema);