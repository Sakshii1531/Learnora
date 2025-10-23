const express = require("express");
const router = express.Router();

// Controllers
const {
  createCourse,
  getAllCourses,
  getCourseDetails,
} = require("../controllers/Course");

const {
  showAllCategories,
  createCategory,
  categoryPageDetails,
} = require("../controllers/Categories");

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/Subsection");

const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview");

// Middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth");

// ===================================================================
// Course Routes
// ===================================================================
router.post("/createCourse", auth, isInstructor, createCourse);
router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.post("/deleteSection", auth, isInstructor, deleteSection);

router.post("/addSubSection", auth, isInstructor, createSubSection);
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

router.get("/getAllCourses", getAllCourses);
router.post("/getCourseDetails", getCourseDetails);

// ===================================================================
// Category Routes (Admin Only)
// ===================================================================
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);

// ===================================================================
// Rating & Review
// ===================================================================
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router;
