const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelper');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');
const { Op } = require('sequelize');

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            // If user exists but not verified, resend OTP
            if (!existingUser.isVerified) {
                const otp = generateOTP();
                const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

                await existingUser.update({ otp, otpExpiry });

                const emailSent = await sendOTPEmail(email, otp, existingUser.fullName);
                if (!emailSent) {
                    return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
                }

                return res.status(200).json({
                    message: 'Account exists but not verified. New OTP sent to your email.',
                    email: existingUser.email
                });
            }
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user (unverified)
        const user = await User.create({
            fullName,
            email,
            password,
            role: role || 'dispatcher',
            otp,
            otpExpiry
        });

        // Send OTP email
        const emailSent = await sendOTPEmail(email, otp, fullName);
        if (!emailSent) {
            return res.status(500).json({ message: 'Account created but failed to send OTP. Use resend OTP.' });
        }

        res.status(201).json({
            message: 'Registration successful! Check your email for the OTP.',
            email: user.email
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified.' });
        }

        // Check OTP match
        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        // Check OTP expiry
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please resend.' });
        }

        // Verify user
        await user.update({
            isVerified: true,
            otp: null,
            otpExpiry: null
        });

        // Generate token
        const token = generateToken(user);

        res.status(200).json({
            message: 'Email verified successfully!',
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error during verification.' });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Email not verified. Please verify your email first.',
                needsVerification: true,
                email: user.email
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = generateToken(user);

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified.' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await user.update({ otp, otpExpiry });

        const emailSent = await sendOTPEmail(email, otp, user.fullName);
        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send OTP email.' });
        }

        res.status(200).json({ message: 'New OTP sent to your email.' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    res.status(200).json({ user: req.user });
};

module.exports = { register, verifyOTP, login, resendOTP, getMe };
