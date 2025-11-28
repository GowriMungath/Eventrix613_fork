const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

const smtpHost = process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io';
const smtpPort = parseInt(process.env.SMTP_PORT || '2525', 10);
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const mailFrom = process.env.MAIL_FROM || 'no-reply@eventrix.local';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
});

const buildQrCode = async (booking) => {
  const qrPayload = {
    bookingReference: booking.bookingReference,
    eventId: booking.eventId,
    eventTitle: booking.eventTitle,
    eventDate: booking.eventDate,
    userEmail: booking.userEmail
  };
  return QRCode.toDataURL(JSON.stringify(qrPayload));
};

const sendEmail = async (options) => {
  try {
    if (!smtpUser || !smtpPass) {
      console.warn('SMTP credentials are not configured. Email not sent.');
      return;
    }
    await transporter.sendMail(options);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const sendBookingEmail = async (booking, event) => {
  const qrImage = await buildQrCode(booking);
  const eventDate = new Date(booking.eventDate).toLocaleString();

  const mailOptions = {
    from: mailFrom,
    to: booking.userEmail,
    subject: `Your tickets for ${booking.eventTitle}`,
    html: `
      <h2>Booking Confirmed</h2>
      <p>Hi ${booking.userName},</p>
      <p>Your booking <strong>${booking.bookingReference}</strong> for <strong>${booking.eventTitle}</strong> is confirmed.</p>
      <ul>
        <li>Date: ${eventDate}</li>
        <li>Venue: ${booking.eventVenue}</li>
        <li>Tickets: ${booking.numberOfTickets}</li>
        <li>Total: ₹${booking.totalAmount}</li>
      </ul>
      <p>Show the QR code below at the entrance:</p>
      <img src="${qrImage}" alt="QR Code" style="max-width:220px;" />
      <p>Thank you for choosing Eventrix.</p>
    `
  };

  await sendEmail(mailOptions);
};

const sendWaitlistEmail = async (booking, event) => {
  const mailOptions = {
    from: mailFrom,
    to: booking.userEmail,
    subject: `Waitlist confirmation for ${booking.eventTitle}`,
    html: `
      <h2>You're on the waitlist</h2>
      <p>Hi ${booking.userName},</p>
      <p>The event <strong>${booking.eventTitle}</strong> is currently full. We've added you to the waitlist.</p>
      <p>We'll notify you automatically if seats open up. Your waitlist reference is <strong>${booking.bookingReference}</strong>.</p>
      <p>Date: ${new Date(booking.eventDate).toLocaleString()} | Venue: ${booking.eventVenue}</p>
      <p>Requested tickets: ${booking.numberOfTickets}</p>
    `
  };

  await sendEmail(mailOptions);
};

module.exports = {
  sendBookingEmail,
  sendWaitlistEmail
};
