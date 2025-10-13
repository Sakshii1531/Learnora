const Subsection  = require("../models/SubSection");
const Section = require("../models/Section");


//create Subsection
exports.createSubSection = async (req , res) => {
    try{
        //fetch data
        //validation
        

    } catch(error){
        return res.status(400).json({
            success:false,
            message:"Subsection creation get failed",
        });
    }
}