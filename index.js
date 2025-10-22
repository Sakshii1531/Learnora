const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const { cloudinaryConnect } = require("./config/cloudinary");
const database = require("./config/database");

// Route imports
const userRoutes = require("./routes/User");
const courseRoutes = require("./routes/Course");
const paymentsRoutes = require("./routes/Payments");
const profileRoutes = require("./routes/Profile");

dotenv.config();
const PORT = process.env.PORT || 4000;


// Database Connection

database.connect();


// Middlewares

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// Cloudinary Connect
cloudinaryConnect();


// Routes

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentsRoutes);

// Default Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Your server is up and running...",
  });
});


// Start Server

app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});
