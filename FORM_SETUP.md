# Form Submission Setup Guide

## Google Apps Script Setup

To enable form submissions to send emails, you need to set up a Google Apps Script Web App:

### Step 1: Create Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the following:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Send email
    const subject = `New Design Submission from ${data.name}`;
    const body = `
      Name: ${data.name}
      Email: ${data.email}
      Portfolio: ${data.portfolio}
      Category: ${data.category}
      Description: ${data.description}
      Terms Accepted: ${data.terms ? 'Yes' : 'No'}
      Submitted: ${data.timestamp}
    `;
    
    const recipient = 'shailendramourya17@gmail.com'; // Replace with your email
    
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: body
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 2: Deploy as Web App
1. Click "Deploy" > "New deployment"
2. Choose "Web app" as type
3. Set execution as "Me"
4. Set access to "Anyone"
5. Click "Deploy"
6. Copy the Web App URL

### Step 3: Update JavaScript File
1. Open `scripts/submit-form.js`
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your actual Web App URL
3. Save the file

### Step 4: Test the Form
1. Open your website
2. Fill out the submission form
3. Check your email for the submission

## Form Features

### Glassmorphism Design
- Semi-transparent background with blur effect
- Gradient background with animated dots
- Smooth animations and transitions
- Mobile responsive design

### Form Fields
- **Name**: Required text input
- **Email**: Required email input with validation
- **Portfolio URL**: Required URL for Behance, Dribbble, etc.
- **Description**: Required textarea for design style description
- **Category**: Required dropdown (Illustration, Logo, Poster, Motivation)
- **Terms**: Required checkbox for agreement

### Validation & UX
- Real-time form validation
- Loading states during submission
- Success/error message display
- Form reset after successful submission
- Icon indicators for each field

### Email Template
The script sends an email with all form data including:
- Submitter's contact information
- Portfolio link for review
- Design category and description
- Timestamp of submission
- Terms acceptance confirmation

## Customization

### Styling
- Main styles in `styles/style.css` and `styles/design.css`
- Modify colors, gradients, and animations as needed
- Background patterns and effects can be customized

### Email Content
- Modify the email template in Google Apps Script
- Add additional fields or formatting
- Set up auto-responders if needed

### Form Fields
- Add/remove fields in the HTML
- Update validation in JavaScript
- Modify the email template accordingly

## Security Notes
- The Google Apps Script runs under your account
- Form submissions are processed server-side
- No sensitive data is stored client-side
- Consider adding rate limiting for production use
