// Form submission handler with Google Apps Script
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('submitForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            // Collect form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Add timestamp
            data.timestamp = new Date().toISOString();
            
            // Replace with your Google Apps Script Web App URL
            const scriptURL = 'owxmyabwxnxawwom';
            
            fetch(scriptURL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    showSuccessMessage();
                    form.reset();
                } else {
                    showErrorMessage();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorMessage();
            })
            .finally(() => {
                // Restore button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});

function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'form-message success';
    message.innerHTML = `
        <i class="fa fa-check-circle"></i>
        <span>Thank you! Your submission has been received. We'll review your work and get back to you soon.</span>
    `;
    
    const form = document.getElementById('submitForm');
    form.parentNode.insertBefore(message, form);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

function showErrorMessage() {
    const message = document.createElement('div');
    message.className = 'form-message error';
    message.innerHTML = `
        <i class="fa fa-exclamation-circle"></i>
        <span>Sorry, there was an error submitting your work. Please try again or contact us directly.</span>
    `;
    
    const form = document.getElementById('submitForm');
    form.parentNode.insertBefore(message, form);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// Google Apps Script Code (to be deployed as Web App)
/*
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
*/
