const Profile = require("../models/Profile");
const User  = require("../models/User");

exports.updateProfile = async (req , res) => {
    try{
        //get data
        const {dateOfBirth="",about="",contactNumber,gender} = req.body;

        //get userId
        const id = req.user.id;

        //validation
        if(!contactNumber || !gender || !id){
            return res.status(404).json({
                success:false,
                message:"All fields are required",
            });
        }

        //findProfile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about=about;
        profileDetails.gender = gender;
        profileDetails.contactNumber=contactNumber;
        await profileDetails.save();

        //return response
        return res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            profileDetails,
        });

    } catch(error){
        return res.status(400).json({
            success:false,
            message:"Profile updation failed",
        });
    }
};

//delete account 

exports.deleteAccount = async (req , res) => {
    try{
        //get id
        const id = req.user.id;

        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found",
            });
        }

        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        
        //todo hw -> unenroll user from all enrolled courses
        //task scheduling -> how
        //what is cron job

        //delete user
        await User.findByIdAndDelete({_id:id});
 
        //return response
        return res.status(200).json({
            success:true,
            message:"Account deleted successfully",
        });

    } catch(error){
        return res.status(400).json({
            success:false,
            message:"Account can not be delete because of some reason",
        });
    }
};

exports.getAllUserDetails = async(Req , res) => {
    try{
        const {id} = req.user.id;

        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found",
            });
        }

        return res.status(200).json({
            success:true,
            message:"All details fetched successfully",
        });

    } catch(error){
        return res.status(400).json({
            success:false,
            message:"All details can not be fetched",
        });
    }
}