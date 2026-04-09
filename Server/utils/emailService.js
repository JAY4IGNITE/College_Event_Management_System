const nodemailer = require('nodemailer');

// For MVP, we use Nodemailer with Environment Variables or Ethereal for testing
// If SMTP_HOST is not set in process.env, it will fallback to generating an Ethereal test account.
let transporter;

async function initTransporter() {
    if (transporter) return;
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Fallback to test account
        console.log('No SMTP credentials found. Creating Ethereal test account...');
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        console.log('Ethereal test account created successfully.');
    }
}

const getOutlookHtmlTemplate = (eventTitle, eventDate, eventLocation, recipientName) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>New Event Announcement</title>
  <!--[if mso]>
  <style>
    table {border-collapse:collapse;border-spacing:0;border:none;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;word-spacing:normal;background-color:#f1f5f9;">

  <!-- Preheader -->
  <div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    A new event (${eventTitle}) has just been announced at Aditya University! 
  </div>

  <table role="presentation" style="width:100%;border:none;border-spacing:0;background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table role="presentation" style="width:100%;max-width:600px;border:none;border-spacing:0;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:40px;text-align:center;background-color:#0ea5e9;">
              <h1 style="margin:0;font-family:Arial,sans-serif;font-size:24px;color:#ffffff;">New Campus Event!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;font-family:Arial,sans-serif;font-size:16px;line-height:24px;color:#334155;">
              <p style="margin:0 0 16px 0;">Hi ${recipientName},</p>
              <p style="margin:0 0 16px 0;">We're excited to announce a highly anticipated event: <strong>${eventTitle}</strong>.</p>
              
              <!-- Outlook Safe Spacer -->
              <table role="presentation" style="width:100%;border:none;border-spacing:0;">
                <tr>
                  <td style="padding:16px;background-color:#f8fafc;border-left:4px solid #0ea5e9;border-radius:4px;">
                    <strong>Date:</strong> ${eventDate}<br>
                    <strong>Location:</strong> ${eventLocation}
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0;text-align:center;">
                <!-- Button: VML fallback for Outlook -->
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="http://localhost:5173" style="height:46px;v-text-anchor:middle;width:200px;" arcsize="10%" stroke="f" fillcolor="#0ea5e9">
                  <w:anchorlock/>
                  <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">View on Portal</center>
                </v:roundrect>
                <![endif]-->
                <!--[if !mso]><!-->
                <a href="http://localhost:5173" style="background-color:#0ea5e9;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;display:inline-block;font-weight:bold;">View on Portal</a>
                <!--<![endif]-->
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#94a3b8;background-color:#f8fafc;">
              You are receiving this email because you are a registered student.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

async function sendEventPublishedEmail(event, students) {
    try {
        await initTransporter();

        console.log(`Sending emails to ${students.length} students...`);
        
        // Loop through students (Mvp approach, ideally use a job queue like BullMQ in production)
        for (const student of students) {
            const htmlContent = getOutlookHtmlTemplate(
                event.title, 
                event.date, 
                event.location || 'TBA', 
                student.name || 'Student'
            );

            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Aditya University Events" <no-reply@college.edu>',
                to: student.email,
                subject: `New Event: ${event.title}`,
                html: htmlContent
            });

            // If using Ethereal, log URL for previewing
            if (info.messageId && nodemailer.getTestMessageUrl(info)) {
                console.log(`Email Preview for ${student.email}: ${nodemailer.getTestMessageUrl(info)}`);
            }
        }

        console.log('Successfully completed sending notification emails.');
    } catch (err) {
        console.error('Failed to send event notification emails:', err);
    }
}

module.exports = {
    sendEventPublishedEmail
};
