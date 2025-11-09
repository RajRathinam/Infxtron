// utils/sendEmailSendGrid.js
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmailSendGrid = async ({ to, subject, html }) => {
  try {
    const msg = {
      to: to,
      from: {
        email: process.env.SENDGRID_VERIFIED_SENDER,
        name: "AG's Healthy Food"
      },
      subject: subject,
      html: html,
    };

    console.log('Sending email via SendGrid to:', to);
    const result = await sgMail.send(msg);
    console.log('Email sent successfully via SendGrid');
    return result;
  } catch (error) {
    console.error('SendGrid email failed:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    
    throw error;
  }
};