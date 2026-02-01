
// Replace with your actual Key ID from Razorpay Dashboard
// For testing, use "Test Key" mode keys
const RAZORPAY_KEY_ID = 'YOUR_RAZORPAY_KEY_ID';

export const initializeRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

export const openPaymentModal = (
    amount: number,
    orderData: { name: string; email?: string; contact: string; desc?: string },
    onSuccess: (response: any) => void,
    onFailure: (error: any) => void
) => {
    const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount * 100, // Amount is in paise
        currency: 'INR',
        name: 'Divine Guidance Studio',
        description: orderData.desc || 'Crystal Healing Order',
        image: '/assets/logo.png', // Ensure you have a logo or remove this line
        handler: function (response: any) {
            onSuccess(response);
        },
        prefill: {
            name: orderData.name,
            email: orderData.email || '',
            contact: orderData.contact,
        },
        notes: {
            address: 'Divine Guidance Studio Online',
        },
        theme: {
            color: '#f43f5e', // Rose-500 color matches site theme
        },
        modal: {
            ondismiss: function () {
                onFailure({ reason: 'Payment Cancelled' });
            }
        }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
};
