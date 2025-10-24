const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const mailSender = require('../utils/mailSender');
const { passwordUpdated } = require('../mail/templates/passwordUpdate');
const Profile = require('../models/Profile');
require('dotenv').config();


// Send OTP for email verification
exports.sendotp = async (req, res) => {
    try {
        // fetch email from request body
        const { email } = req.body;

        // check if user already exists
        const checkUserPresent = await User.findOne({ email });

        // if user already exists, then return a response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: `User is Already Registered`,
            });
        }

        // generate OTP & ensure uniqueness
        let otp;
        let result;
        do {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        } while (result);

        const otpPayload = { email, otp };
        // create an entry for OTP 
        const otpBody = await OTP.create(otpPayload);

        // return response successfully
        res.status(200).json({
            success: true,
            message: `OTP Sent Successfully`,
            otp,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Signup controller for registering users
exports.signup = async (req, res) => {
    try {
        // data fetch from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        // validate data
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !otp
        ) {
            return res.status(403).json({
                success: false,
                message: 'All Fields are required',
            });
        }

        // check if Password and confirm password matches or not?
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password and Confirm Password do not match. Please try again',
            });
        }

        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists. Please Sign in to continue.',
            });
        }

        // find most recent OTP for the email
        const otpRecords = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        const recentOtpRecord = otpRecords[0];

        // validate OTP
        if (!recentOtpRecord) {
            return res.status(400).json({
                success: false,
                message: 'The OTP is not valid',
            });
        }
        if (otp !== recentOtpRecord.otp) {
            return res.status(400).json({
                success: false,
                message: 'The OTP is not valid',
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // determine approval status for instructor
        let approved = accountType === 'Instructor' ? false : true;

        // create the additional profile for user
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            approved: approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // return response
        return res.status(200).json({
            success: true,
            user,
            message: 'User Registered Successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'User Cannot be Registered, Please Try Again.',
        });
    }
};


// login
exports.login = async (req, res) => {
    try {
        // get data from req body
        const { email, password } = req.body;

        // validation of data
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: `Please Fill up All the Required Fields`,
            });
        }

        // check user exists or not
        const user = await User.findOne({ email }).populate('additionalDetails');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: `User is not registered with Us, Please signup to Continue`,
            });
        }

        // Generate JWT, after password match
        if (await bcrypt.compare(password, user.password)) {
            const payLoad = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            };
            const token = jwt.sign(payLoad, process.env.JWT_SECRET, {
                expiresIn: '2h',
            });

            // save token to user document in database
            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            res.cookie('token', token, options).status(200).json({
                success: true,
                token,
                user,
                message: `User Login Success`,
            });
        } else {
            return res.status(401).json({
                success: false,
                message: `Password Is Incorrect`,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Login Failure Please Try Again`,
        });
    }
};


// changePassword
exports.changePassword = async (req, res) => {
    try {
        // Get user data from req.user
        const userDetails = await User.findById(req.user.id);

        // get oldPassword, newPassword
        const { oldPassword, newPassword } = req.body;

        // Validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        );

        if (!isPasswordMatch) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: 'The Password is Incorrect',
                });
        }

        // update password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        );

        // send notification email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                `Password Updated Successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`,
                passwordUpdated(
                    updatedUserDetails.email,
                    updatedUserDetails.firstName,
                )
            );
            console.log('Email sent successfully................', emailResponse);
        } catch (error) {
            console.log('Error Occurred While Sending Email: ', error);
            return res.status(500).json({
                success: false,
                message: 'Error Occurred While Sending Email',
                error: error.message,
            });
        }

        // Return success response
        return res
            .status(200)
            .json({ success: true, message: 'Password Updated Successfully' });

    } catch (error) {
        console.error('Error Occurred While Updating Password', error);
        return res.status(500).json({
            success: false,
            message: 'Error Occurred While Updating Password',
            error: error.message,
        });
    }
};
