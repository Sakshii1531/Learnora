const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


//send OTP
exports.sendOTP = async (req,res) => {

    try{
        //fetch email from request's body
        const {email} = req.body;

        //check if user already exists
        const checkUserPResent = await User.findOne({email});

        //if user already exist,then return a response
        if(checkUserPResent){
           return res.status(401).json({
            success:false,
            message:'USer already registered',
          })
        }

        //generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated : ", otp);

        //check the OTP is unique or not
        let result = await OTP.findOne({otp : otp});

        while(result) {
            otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
           });
           result = await OTP.findOne({otp : otp});
        }

        const otpPayload = {email , otp};

        //create an entry in DB for OTP

        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successful
        res.status(200).json({
            success:true,
            message:'OTP Sent Successfully',
            otp,
        })

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}


//signUp

exports,signUp = async (req,res) => {
 try{
    //fetch data from request's body
    const{
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp} = res.body;
    
    //validate the data 
    if(!firstName || ! lastName || !email || !password || !confirmPassword || !otp){
        return res.status(403).json({
            success:false,
            message:'All fields are required',
        })
    }
    
    
    //match the two password
    if(password !== confirmPassword){
        return res.status(400).json({
            success:false,
            message:'Password and ConfirmPassword does not match , Please try again',
        });
    }

    //check user already exists or not
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:'User already registered',
        });
    }

    //find most recent OTP
    const recentOtp = (await OTP.find({email})).toSorted({createdAt:-1}).limit(1);
    console.log(recentOtp);

    //validation of OTP (recent)
    if(recentOtp.length == 0){
        //OTP not found
        return res.status(404).json({
            status:false,
            message:'OTP Not Found',
        });
    } else if(otp !== recentOtp.otp){
        //Invalid OTP
        return res.status(400).json({
            success:false,
            message:'Invalid OTP',
        });
    }


    //hash the password -> bcrypt package is needed
    const hasedPassword = await bcrypt.hash(password, 10);
    
    //create entry in DB
    const profilDetails = await Profiler.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:Number,
    });

    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hasedPassword,
        accountType,
        additionalDetails:profilDetails._id,
        image:`http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })

    //return response
    return res.status(200).json({
        success:true,
        message:'User is registered successfully',
        user,
    });
 }  catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:'User cannot be registered . Please try again',
    });
    
 }

}


//login
exports.login =  async (req,res) => {
    try{
        //get data from req body
        const {email,password} = req.body;

        //validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'All fields are required, please try again',
            });
        }


        //user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"USer is not  registered,please signUp first",
            });
        }


        //generate JWT , after Password matching
        if(await bcrypt.compare(password, user.password )){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token = token;
            user.password=undefined;

             //create cookie and send response
             const options = {
                expires:new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
             }
             res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully',
             });
        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }
       

    } catch(error){
        console.log(error);
        return res.status(501).json({
            success:false,
            message:'Logged in failure',
        });

    }
}



//changePassword
exports.changePassword = async (req,res) => {
    try{
        //get data from req body
        const {password} = req.body;

        //get oldPassword, newpassword , confirmnewpassword
        //validate the password
        //update password in db
        //send mail - password updated
        //return response
    } catch(error){
        console.log(error);
        return res.status(501).json({
            success:false,
            message:"Password could not changed",
        });
    }   
}