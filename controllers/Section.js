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
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push:{
                                                    courseContent:newSection._id,
                                                }
                                            },
                                            {new:true},
        )
        //hw -> use populate to replace section/sub-section both in the updatedCourseDetails

  
        //return response
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updatedCourseDetails,
        });

    } catch(error){
        return res.status(400).json({
            success:false,
            message:"Section creation get failed",
            message:error.message,
        });
    }
}


exports.updateSection =  async (req , res) => {
    try{
        //fetch data
        const {sectionName, sectionId} = req.body;

        //validate data
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'All fields are need to be filled',
            });
        }


        //update data
        const section  = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});


        //return response
        return res.status(200).json({
            succsess:true,
            message:"Section updated successfully",
        });

    } catch(Error){
        return res.status(400).json({
            success:false,
            message:"Section updation get failed",
            message:error.message,
        });
    }
}

exports.deleteSection = async (req , res) => {
    try{
        //fetch Id - assuming that we are sending ID in params
        const {sectionId} = req.params;

        //use findby id and delete
        await Section.findByIdAndDelete(sectionId);
         
        // do we need to delete from courseSchema
        //return response
         return res.status(200).json({
            succsess:true,
            message:"Section deleted successfully",
        });  

    } catch(error){
        return res.status(400).json({
            success:false,
            message:"Unable to delete section",
            message:error.message,
        });
    }
}