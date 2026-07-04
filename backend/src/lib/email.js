import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otp) => {
  console.log(`\n==================================================`);
  console.log(`[OTP VERIFICATION] OTP is: ${otp} (sent to ${email})`);
  console.log(`==================================================\n`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("SMTP credentials not configured in backend/.env. OTP logged above for development/testing.");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Bakko Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Bakko Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4F46E5; text-align: center;">Welcome to Bakko!</h2>
          <p>Thank you for creating an account with Bakko. Please use the following One-Time Password (OTP) to verify your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; padding: 12px 24px; background-color: #F3F4F6; border-radius: 6px; border: 1px dashed #4F46E5; color: #4F46E5; display: inline-block;">
              ${otp}
            </span>
          </div>
          <p>This OTP is valid for 10 minutes. Please do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #9CA3AF; text-align: center;">If you did not sign up for a Bakko account, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email verification OTP sent successfully to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
  }
};
