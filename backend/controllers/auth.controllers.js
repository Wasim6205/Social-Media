import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import genToken from '../config/token.js';
import sendMail from '../config/Mail.js';

// Sign up controller
export const signup = async (req, res) => {
    try {
        const { name, userName, email, password } = req.body;
        
        const findByEmail = await User.findOne({ email });
        if (findByEmail) {
            return res.status(400).json({ message: 'Email already exists !' });
        }

        const findByUserName = await User.findOne({ userName });
        if (findByUserName) {
            return res.status(400).json({ message: 'UserName already exists !' });
        }

        if(password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        if (!hashedPassword) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        const user = await User.create({
            name,
            userName,
            email,
            password: hashedPassword,
        });

        const token = await genToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
            secure: true,
            sameSite: 'none',
        })

        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Signup error', error: error.message });
    }
};

// Login controller
export const signIn = async (req, res) => {
    try {
        const { userName, password } = req.body;
        // Find user
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(400).json({ message: 'User not found!' });
        }
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect Password' });
        }
        // Generate JWT
        const token = await genToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
            secure: true,
            sameSite: 'none',
        })
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Signin error', error: error.message });
    }
};

// Logout controller
export const signOut = async (req, res) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Logout error', error: error.message });
    }
}


export const sendOtp = async (req,res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email})
        if(!user) {
            return res.status(400).json({message:"User not found with this email"});
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        user.resetOtp = otp;
        // user.otpExpires = Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        user.isOtpVerified = false;

        await user.save();

        await sendMail(email, otp);
        return res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
}

export const verifyOtp = async (req,res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        // if (!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
        //     return res.status(400).json({ message: 'invalid/expired otp' });
        // }

        if (!user ||String(user.resetOtp) !== String(otp) || new Date(user.otpExpires) < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined;

        await user.save();
        return res.status(200).json({ message: 'otp verified' });
    } catch (error) {
        return res.status(500).json({ message: 'Error verifying OTP', error: error.message }); 
    }
}


export const resetPassword = async (req,res) => {
    try {
        const {password, email} = req.body;
        const user = await User.findOne({email})
        if(!user || !user.isOtpVerified) {
            return res.status(400).json({ message: 'User not found or OTP not verified' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.isOtpVerified = false;
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
}
