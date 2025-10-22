const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const courseRoutes = require("./routes/Course");
const paymentsRoutes = require("./routes/Payments");
const profileRoutes = require("./routes/Profile");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect} = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 4000;

//database connect
database.connect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:3000",
        credentials:true,
    })
)

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
)

//clodinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/auth", profileRoutes);
app.use("/api/v1/auth", courseRoutes);
app.use("/api/v1/auth", paymentsRoutes);

//default route
app.get("/" , (req , res) => {
    return res.json({
        success:true,
        message:"Your server is up ad running.....",
    });
});


app.listen(PORT , () => {
    console.log(`App is ruuning at ${PORT}`);
})


