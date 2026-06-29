export const getVerificationEmailTemplate = (name: string, verificationLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 10px 20px; background-color: #eb0a1e; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Verify Your Account</h2>
    <p>Hi ${name || 'Customer'},</p>
    <p>Thank you for choosing Laxmi Toyota. Please click the button below to verify your email address and activate your account:</p>
    <a href="${verificationLink}" class="button" style="color: #ffffff;">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
    <p>Best regards,<br>Laxmi Toyota Team</p>
  </div>
</body>
</html>
`;

export const getPasswordResetTemplate = (name: string, resetLink: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 10px 20px; background-color: #eb0a1e; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Reset Your Password</h2>
    <p>Hi ${name || 'Customer'},</p>
    <p>We received a request to reset your password. Click the button below to choose a new password:</p>
    <a href="${resetLink}" class="button" style="color: #ffffff;">Reset Password</a>
    <p>This link will expire in 30 minutes.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Best regards,<br>Laxmi Toyota Team</p>
  </div>
</body>
</html>
`;

export const getBookingConfirmationTemplate = (name: string, bookingId: string, vehicleName: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Booking Confirmed</h2>
    <p>Hi ${name || 'Customer'},</p>
    <p>Your booking for the <strong>${vehicleName}</strong> has been successfully initiated.</p>
    <p>Your Booking ID is: <strong>${bookingId}</strong></p>
    <p>Our executive will contact you shortly to guide you through the next steps.</p>
    <p>Best regards,<br>Laxmi Toyota Team</p>
  </div>
</body>
</html>
`;
