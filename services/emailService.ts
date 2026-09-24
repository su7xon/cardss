
import emailjs from '@emailjs/browser';

// Replace these with your actual EmailJS credentials later
// You can find these in your EmailJS Dashboard: https://dashboard.emailjs.com/
const SERVICE_ID = 'service_kaojayj';
const TEMPLATE_ID = 'template_003t25j';
const PUBLIC_KEY = 'u74OrchUF_0ykBPFa';

export const sendBookingNotification = async (bookingData: any, recipientEmail?: string) => {
    try {
        const templateParams = {
            to_name: bookingData.clientName || 'Valued Client',
            to_email: recipientEmail || 'poojagupta14021994@gmail.com',
            email: recipientEmail || 'poojagupta14021994@gmail.com', // Added alias
            reply_to: recipientEmail || 'poojagupta14021994@gmail.com', // Added alias
            recipient_email: recipientEmail || 'poojagupta14021994@gmail.com', // Added alias
            from_name: 'Divine Guidance Studio',
            from_email: 'poojagupta14021994@gmail.com',
            phone: bookingData.phone,
            subject: `Booking Confirmation: ${bookingData.service}`,
            message: `
Namaste ${bookingData.clientName},

Your booking request has been received!

Service: ${bookingData.service}
Date: ${bookingData.date}
Time: ${bookingData.time}
Price: ${bookingData.price}

We will contact you shortly to confirm the details.

Blessings,
Divine Guidance Studio
            `
        };

        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        return { success: true, message: 'Email sent successfully!' };
    } catch (error: any) {
        console.error('FAILED...', error);
        const errorMessage = error?.text || error?.message || JSON.stringify(error);
        return { success: false, error: errorMessage };
    }
};


