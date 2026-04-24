export const inquiryConfirmationTemplate = ({
  name,
  checkIn,
  checkOut,
  experiences,
}: {
  name: string;
  checkIn: string;
  checkOut: string;
  experiences: string[];
}) => `
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: white;">
      <h1 style="color: #8B4513; font-family: Georgia, serif;">Thank You, ${name}!</h1>
      <p>Your Tuscan itinerary has been received.</p>
      <p>
        <strong>Stay dates:</strong> ${checkIn} to ${checkOut}
      </p>
      <p>
        <strong>Experiences:</strong>
      </p>
      <ul>
        ${experiences.map((exp) => `<li>${exp}</li>`).join('')}
      </ul>
      <p>Our concierge will contact you within 4 hours with your all-inclusive package quote.</p>
      <p>Best regards,<br />Florence Premium Tours</p>
    </div>
  </body>
</html>
`;

export const operatorNotificationTemplate = ({
  name,
  email,
  phone,
  checkIn,
  checkOut,
  experiences,
}: {
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  experiences: string[];
}) => `
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: white;">
      <h1 style="color: #8B4513;">New Inquiry Submitted</h1>
      <p>
        <strong>Guest Name:</strong> ${name}
      </p>
      <p>
        <strong>Email:</strong> ${email}
      </p>
      <p>
        <strong>Phone:</strong> ${phone || 'Not provided'}
      </p>
      <p>
        <strong>Stay Dates:</strong> ${checkIn} to ${checkOut}
      </p>
      <p>
        <strong>Requested Experiences:</strong>
      </p>
      <ul>
        ${experiences.map((exp) => `<li>${exp}</li>`).join('')}
      </ul>
      <p>
        <a href="https://admin.tuscanyplanner.com" style="color: #8B4513; font-weight: bold;">View in Admin Dashboard</a>
      </p>
    </div>
  </body>
</html>
`;
