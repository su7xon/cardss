
import emailjs from '@emailjs/browser';

// Replace these with your actual EmailJS credentials later
// You can find these in your EmailJS Dashboard: https://dashboard.emailjs.com/
const SERVICE_ID = 'service_kaojayj';
const TEMPLATE_ID = 'template_003t25j';
const PUBLIC_KEY = 'u74OrchUF_0ykBPFa';

export const sendBookingNotification = async (bookingData: any) => {
    try {
        const templateParams = {
            to_name: 'Pooja/Admin',
            to_email: 'poojagupta14021994@gmail.com', // Admin Email from Footer
            from_name: bookingData.clientName,
            from_email: bookingData.email,
            phone: bookingData.phone,
            subject: `New Booking: ${bookingData.service}`,
            message: `
New booking request received:

Service: ${bookingData.service}
Date: ${bookingData.date}
Time: ${bookingData.time}
Price: ${bookingData.price}

Client Details:
Name: ${bookingData.clientName}
Email: ${bookingData.email}
Phone: ${bookingData.phone}

Birth Details:
${bookingData.birthDetails ? `DOB: ${bookingData.birthDetails.dob}
Time: ${bookingData.birthDetails.tob}
Place: ${bookingData.birthDetails.pob}` : 'N/A'}
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

export const sendOrderNotification = async (orderData: any) => {
    try {
        // Format items list for email
        const itemsList = orderData.items.map((item: any) =>
            `- ${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}`
        ).join('\n');

        const templateParams = {
            to_name: 'Pooja/Admin',
            to_email: 'poojagupta14021994@gmail.com', // Admin Email from Footer
            from_name: orderData.customerName,
            from_email: orderData.email || 'No Email Provided', // Fallback if guest
            phone: orderData.phone,
            subject: `New Order: ₹${orderData.total}`,
            message: `
New Order Received!

Items:
${itemsList}

Total Amount: ₹${orderData.total}
Payment Method: ${orderData.paymentMethod}

Customer Details:
Name: ${orderData.customerName}
Phone: ${orderData.phone}
Address: ${orderData.address}
Pincode: ${orderData.pincode}
            `
        };

        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        return { success: true, message: 'Order email sent successfully!' };
    } catch (error: any) {
        console.error('Order Email Failed:', error);
        const errorMessage = error?.text || error?.message || JSON.stringify(error);
        return { success: false, error: errorMessage };
    }
};
