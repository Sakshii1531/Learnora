const category = require("../models/categories");

//create tah ka handler function

exports.createCategory = async(req , res) => {
    try{
        const {name,description} = req.body;
        
        //validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        //create entry in DB
        const tagDetails = await category.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);


        //return response
        return res.status(200).json({
            success:true,
            message:"Category created successfully",
        });

    } catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}


//get all tags
exports.showlAllcategory = async(Req , res) => {
    try{
        const allTags = await category.find({} , {name:true , description:true});
        res.status(200).json({
            success:true,
            message:"All category returned successfully",
            allTags,
        });

    } catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
            message:"Category are not showing , because of some error",
        });
    }
}

exports.categoryPageDetails = async(req ,res) => {
    try{
        //get category id
        const {categoryId} = req.body;

        //get courses for specified categoryId
        const selectedCategory = await Category.findById(categoryId)
                                       .populate("course")
                                       .exec();

        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:'Data is not found',
            });
        }

        //get course for different categories
        const differentCategories = await Category.find({
                                    _id:{$ne:categoryId},
                                    })
                                    .populate("courses")
                                    .exec(); 
                                    
        //get top selling course => H.W.
        
        //return response
        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
            },
        });


    } catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    }
} 