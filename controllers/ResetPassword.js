const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");


// resetPasswordToken
exports.resetPasswordToken = async(req , res) =>{
    try{
        //get email from request's body
        const {email} = req.body;
        //validation for email -> to check user exits or not
        const user = await User.findOne({email:email});
        if(!user){
            return res.json({
                success:false,
                message:"Your Email is  not registered with us",
            });
        }

        //generate token 
        const token = crypto.randomUUID();

        //update user by adding token and expiration time
        const updatedDetails = await User.findByIdAndUpdate(
                                    {email:email},
                                    {
                                        token:token,
                                        resetPasswordExpires:Date.now() + 5*60*1000,
                                    },
                                    {new:true}); // isse updated document return hota hai

        //creat url
        const url = `http://localhost:3000/update-password/${token}`

        //send mail containing the url
        await mailSender(email,
                        "Password Reset Link",
                        `Password Reset Link : ${url}`);

        //return response
        return res.json({
            success:true,
            message:'Email sent successfully , please check email and change password',
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Something went wrong while sending mail and reset password',
        });
    }
}



//resetPassword
exports.resetPassword = async(req , res) => {
    try{
        //fetch data
        const {password, confirmPassword, token} = req.body;

        //validation
        if(!password !== confirmPassword){
            return res.json({
                success:false,
                message:"Password is not matching",
            });
        }

        //get userdetails from db using token
        const userdetails = await User.findOne({token:token});

        //if no entry - invalid token
        if(!userdetails){
            return res.json({
                success:false,
                message:'Token is invalid',
            });
        }

        //token time check
        if( userdetails.resetPasswordExpires <  Date.now() ){
            return res.json({
                success:false,
                message:'Token is expired, please regenerate your token',
            });
        }

        //hash password
        const hasedPassword = await bcrypt.hash(password,10);

        //update the password
        await User.findOneAndUpdate(
            {token:token},
            {password:hasedPassword},
            {new:true},
        );

        //return response
        return res.status(200).json({
            success:true,
            message:'Password reset successful',
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Password could not be reset',
        });

    }
}