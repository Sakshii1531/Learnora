const Course = require("../models/Course");
const Category = require("../models/categories");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createCourse handler function
exports.createCourse = async (req , res) =>{
    try{
        
        //fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        //get thumbnail image
        const thumbnail = req.files.thumbnailImage;

        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All fields are need to be filled",
            });
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor Details not found",
            });
        }

        //check given tag is valid or not
        const tagDetails = await Category.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"Category Details not found",
            });
        }

        //upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        //create entry for new Course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        });

        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate({
            _id:instructorDetails._id
           },
           {
            $push:{
                courses: newCourse._id,
            }
           },
           {new:true},
        );

        //update the tag ka schema
        await Course.findByIdAndUpdate({
            _id:tagDetails._id
           },
            {
                $push:{
                    tag:newCourse._id,
                }
            },
            {new:true},
        );

        //return response
        return res.status(200).json({
            success:true,
            message:"Course created successfully",
            data:newCourse,
        });

    } catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
            message:"Course did not created because of some reason",
        });
    }
}



//get all courses handler
exports.getAllCourses = async (req , res) => {
    try{
        const allCourses = await Course.find({}, {courseName:true,
                                                  price:true,
                                                  thumbnail:true,
                                                  instructor:true,
                                                  ratingAndReview:true,
                                                  studentsEnrolled:true,
                                                  }).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
        });                                     

    } catch(error){
        console.log(error);
        return res. status(500).json({
            success:false,
            message:'Cannot fetch course data',
            message:error.message,
        });
    }
}

