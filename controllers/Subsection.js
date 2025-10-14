
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const {uploadImageToCloudinary} = require("../utils/imageUploader");


//create Subsection
exports.createSubSection = async (req , res) => {
    try{
        //fetch data from req body
        const {title,timeDuration,description,sectionId} = req.body;

        //extract file/video
        const video = req.files.videoFile;

        //validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required to fill",
            });
        }

        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        //create a sub-section
        const SubSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        });

        //update section with this sub section objectId
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                               {
                                                                $push:{
                                                                    subSection:SubSectionDetails._id,

                                                                }
                                                               },
                                                               {new:true}
        );

        //log updated section here after adding populate quert

        //return response
        return res.status(200).json({
            success:true,
            message:"Subsection created successfully",
            updatedSection,
        });

    } catch(error){
        return res.status(400).json({
            success:false,
            message:"Subsection creation get failed",
        });
    }
}

//hw updateSubSection

//hw deleteSubsection