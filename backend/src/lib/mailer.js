const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.MAIL_FROM || "LearnLoop <no-reply@learnloop.app>",
    to,
    subject: "LearnLoop — Verify Your Institution Email",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: 'Inter', sans-serif; background: #f4f7fb; margin: 0; padding: 0;">
          <div style="max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #1E3A5F, #00B4A0); padding: 32px 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">LearnLoop</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Learn. Teach. Grow Together.</p>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #1E3A5F; font-size: 20px; margin: 0 0 12px;">Verify Your Institution Email</h2>
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
                Use the code below to verify your institution email. This code expires in <strong>10 minutes</strong>.
              </p>
              <div style="background: #f0f7ff; border: 2px dashed #00B4A0; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 28px;">
                <span style="font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #1E3A5F;">${otp}</span>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
