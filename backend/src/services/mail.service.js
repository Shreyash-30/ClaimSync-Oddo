const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    // Use environment variables or fallback to null/empty
    const envUser = process.env.SMTP_USER;
    const envPass = process.env.SMTP_PASS;
    const envHost = process.env.SMTP_HOST;

    let auth = { user: envUser, pass: envPass };
    let host = envHost || 'smtp.ethereal.email';
    let port = process.env.SMTP_PORT || 587;

    // AUTO-PROVISION TEST ACCOUNT: Trigger if User or Pass is missing/placeholder
    if (!envUser || envUser === 'placeholder' || !envPass || envPass === 'placeholder') {
      console.log('--- [MAIL SYSTEM]: No SMTP configured. Provisioning Ethereal test account...');
      try {
        const testAccount = await nodemailer.createTestAccount();
        auth = { user: testAccount.user, pass: testAccount.pass };
        host = 'smtp.ethereal.email';
        port = 587;
        console.log(`--- [MAIL SYSTEM]: Provisioned: ${auth.user}`);
      } catch (err) {
        console.error('--- [MAIL SYSTEM ERROR]: Failed to create test account:', err.message);
        throw err;
      }
    }

    console.log(`--- [MAIL SYSTEM DEBUG]: SMTP CONFIG: host=${host}, port=${port}, user=${auth.user}`);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: Number(port) === 465,
      auth,
      tls: {
          rejectUnauthorized: false // Helps in some restrictive environments
      }
    });

    this.isInitialized = true;
  }

  async sendActivationEmail(email, name, token) {
    await this.init();
    const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/activate/${token}`;
    
    const mailOptions = {
      from: `"ClaimSync Team" <${process.env.SMTP_FROM || 'noreply@claimsync.com'}>`,
      to: email,
      subject: 'Activate Your ClaimSync Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">ClaimSync</h1>
          </div>
          <div style="padding: 30px;">
            <h2>Welcome, ${name}!</h2>
            <p>Your account has been created by your administrator. To get started and set your password, please click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationUrl}" 
                 style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 Activate My Account
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">This link will expire in 24 hours. If you didn't expect this email, please ignore it.</p>
          </div>
          <div style="background-color: #f9f9f9; color: #999; padding: 15px; text-align: center; font-size: 12px;">
            &copy; 2026 ClaimSync Enterprise. All rights reserved.
          </div>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Activation email sent: %s', info.messageId);
      
      // If using Ethereal, log the preview URL
      if (process.env.SMTP_HOST === 'smtp.ethereal.email' || !process.env.SMTP_HOST) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
      return info;
    } catch (error) {
      console.error('Error sending activation email:', error);
      throw new Error('Failed to send activation email.');
    }
  }

  async sendCredentialsEmail(email, name, password) {
     await this.init();
     // Secondary option requested by user: Send direct login info
     const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/login`;
     
     const mailOptions = {
        from: `"ClaimSync Team" <${process.env.SMTP_FROM || 'noreply@claimsync.com'}>`,
        to: email,
        subject: 'Your ClaimSync Credentials',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
               <h1 style="margin: 0;">ClaimSync</h1>
            </div>
            <div style="padding: 30px;">
               <h2>Hi ${name},</h2>
               <p>Your enterprise account is ready. Below are your login credentials:</p>
               <div style="background: #f4f4f4; padding: 20px; border-radius: 5px; font-family: monospace; margin: 20px 0;">
                  <strong>Email:</strong> ${email}<br/>
                  <strong>Password:</strong> ${password}
               </div>
               <p>For security, please change your password after your first login.</p>
               <div style="text-align: center; margin: 30px 0;">
                  <a href="${loginUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
               </div>
            </div>
          </div>
        `
     };
     
     return this.transporter.sendMail(mailOptions);
  }
}

module.exports = new MailService();
