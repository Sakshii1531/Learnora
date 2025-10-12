const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req , res )=> {
    try{
        //data fetch
        const {sectionName,courseId} = req.body;

        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'All fields are need to be filled',
            });
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update course with section objectID
        const updatedCourse = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push:{
                                                    courseContent:newSection._id,
                                                }
                                            },
                                            {new:true},
        )


        //return response
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
        });

    } catch(error){
        return res.status(400).json({
            success:false,
            message:"Section creation get failed",
            message:error.message,
        });
    }
}