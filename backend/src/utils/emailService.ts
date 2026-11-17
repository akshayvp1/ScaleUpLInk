import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = Number(process.env.SMTP_PORT || (smtpHost ? 587 : 0));
const smtpSecure =
  process.env.SMTP_SECURE === "true" ||
  (!process.env.SMTP_SECURE && Boolean(smtpHost && smtpPort === 465));

const transporter = nodemailer.createTransport(
  smtpHost
    ? {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
      }
    : {
        service: process.env.SMTP_SERVICE || "gmail",
        auth: { user: smtpUser, pass: smtpPass },
      }
);

export const sendOTPEmail = async (
  email: string,
  otp: string,
  ttlSeconds = 600
): Promise<void> => {
  if (!smtpUser || !smtpPass) {
    throw new Error("Email service is not configured. Set SMTP_USER and SMTP_PASS.");
  }

  const minutes = Math.max(1, Math.ceil(ttlSeconds / 60));
  const mailOptions = {
    from: process.env.SMTP_FROM || smtpUser,
    to: email,
    subject: "Your OTP for ScaleUp Link",
    text: `Your OTP is ${otp}. It is valid for ${minutes} minute${minutes === 1 ? "" : "s"}.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}: ${info.response}`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`Failed to send OTP to ${email}:`, error);
    throw new Error(`Failed to send OTP email: ${reason}`);
  }
};
