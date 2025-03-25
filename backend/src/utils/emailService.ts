import nodemailer from "nodemailer";
import redisClient from "../config/redisConfig"; // ✅ Import Redis Config

// ✅ Email Transporter Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * ✅ Send OTP via Email & Store in Redis
 * @param {string} email - Recipient Email
 * @param {string} otp - One-Time Password
 */
export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  try {
    // ✅ Ensure Redis is connected before proceeding
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // ✅ Store OTP in Redis with a 10-minute expiration
    await redisClient.setEx(`otp:${email}`, 600, otp);

    // ✅ Email Options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP for Login",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    };

    // ✅ Send Email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${email}: ${info.response}`);
  } catch (error) {
    console.error("❌ Failed to send OTP:", error);
    throw new Error("Failed to send OTP email");
  }
};

/**
 * ✅ Verify OTP from Redis
 * @param {string} email - User Email
 * @param {string} userOTP - Entered OTP
 * @returns {Promise<boolean>} - Returns true if OTP is valid, otherwise false
 */
export const verifyOTP = async (email: string, userOTP: string): Promise<boolean> => {
  try {
    // ✅ Ensure Redis is connected before proceeding
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    const storedOTP = await redisClient.get(`otp:${email}`);

    if (!storedOTP) {
      console.log("❌ OTP expired or not found");
      return false;
    }

    if (storedOTP === userOTP) {
      await redisClient.del(`otp:${email}`); // ✅ Delete OTP after successful verification
      console.log("✅ OTP verified successfully");
      return true;
    }
    
    console.log("❌ Invalid OTP");
    return false;
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    return false;
  }
};
