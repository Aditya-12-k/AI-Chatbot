
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import transporter from "../config/email.js";
import nodemailer from "nodemailer";

// ==========================================
// REGISTER USER
// ==========================================
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Check existing user
        const existingUser = await userModel.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        // Token expiry: 10 minutes
        const verificationTokenExpiry = new Date(
            Date.now() + 10 * 60 * 1000
        );

        // Create user
        const newUser = await userModel.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashPassword,
            isVerified: false,
            verificationToken,
            verificationTokenExpiry
        });

        // Verification URL
        const verificationUrl =
            `http://localhost:8000/api/auth/verify-email?token=${verificationToken}`;

        // Send verification email
        const emailInfo = await transporter.sendMail({
            from: `"AI Chatbot" <${process.env.GOOGLE_USER}>`,
            to: normalizedEmail,
            subject: "Verify Your Email - AI Chatbot",
            text: `Hello ${name}, please verify your email using this link: ${verificationUrl}. This link expires in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome, ${name}!</h2>

                    <p>Thank you for registering with AI Chatbot.</p>

                    <p>Please verify your email address by clicking below:</p>

                    <a href="${verificationUrl}"
                       style="display:inline-block;
                       padding:12px 20px;
                       background-color:#2563eb;
                       color:white;
                       text-decoration:none;
                       border-radius:6px;">
                        Verify Email
                    </a>

                    <p>This verification link expires in 10 minutes.</p>

                    <p>If you did not create this account, please ignore this email.</p>
                </div>
            `
        });

        // Log email information
        console.log("Verification email sent:", emailInfo.messageId);

       

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email."
        });

    } catch (error) {
        console.error("Registration Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ==========================================
// LOGIN USER
// ==========================================
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Find user
        const user = await userModel.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email or password invalid"
            });
        }

        // Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Email or password invalid"
            });
        }

        // Check email verification
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before login"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ==========================================
// GET LOGGED-IN USER
// ==========================================
export const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await userModel
            .findById(userId)
            .select("-password -verificationToken -verificationTokenExpiry");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            user
        });

    } catch (error) {
        console.error("Get User Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// ==========================================
// LOGOUT USER
// ==========================================
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });

    } catch (error) {
        console.error("Logout Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// verify user email 
export const verifyEmail = async(req,res)=>{
    try{
        const {token} = req.query;
        if(!token){
            return res.status(400).json({
                success:false,
                message:"Verifcation token is required"
            });
        }
        const user = await userModel.findOne({
            verificationToken:token,
            verificationTokenExpiry:{$gt:Date.now()}
        });
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Invalid or expired verification token"
            });

        }
        // verify user 
        user.isVerified = true
        user.verificationToken = null
        user.verificationTokenExpiry = null
        await user.save()
        return res.status(200).json({
            success:true,
            message:"Email verified successfully. you can now login"
        });

    }catch(error){
        console.error("Email verification Error:",error.message);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}