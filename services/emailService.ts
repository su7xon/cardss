
import emailjs from '@emailjs/browser';

// Replace these with your actual EmailJS credentials later
// You can find these in your EmailJS Dashboard: https://dashboard.emailjs.com/
const SERVICE_ID = 'YOUR_SERVICE_ID';
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

export const sendBookingNotification = async (bookingData: any) => {
    try {
        const templateParams = {
            to_name: 'Pooja/Admin', // The receiver
            from_name: bookingData.clientName, // The client who booked
            from_email: bookingData.email,
            phone: bookingData.phone,
            service_name: bookingData.service,
            price: bookingData.price,
            date: bookingData.date,
            time: bookingData.time,
            birth_details: bookingData.birthDetails ? `
        DOB: ${bookingData.birthDetails.dob}
        Time: ${bookingData.birthDetails.tob}
        Place: ${bookingData.birthDetails.pob}
      ` : 'N/A',
            message: `New booking request for ${bookingData.service} on ${bookingData.date} at ${bookingData.time}.`
        };

        const response = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
        );

        console.log('SUCCESS!', response.status, response.text);
        return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('FAILED...', error);
        // We return success true anyway because the database booking might have succeeded, 
        // and we don't want to show an error to the user just because the email failed.
        // Instead we log it.
        return { success: false, error: error };
    }
};
