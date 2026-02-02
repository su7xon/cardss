
// @ts-ignore
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export const initializeRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if ((window as any).Razorpay) {
            resolve(true);
            return;
        }
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

export const openPaymentModal = async (
    amount: number,
    orderData: { name: string; email?: string; contact: string; desc?: string },
    onSuccess: (response: any) => void,
    onFailure: (error: any) => void
) => {
    // 0. Validate Amount
    if (!amount || amount <= 0) {
        alert('Error: Invalid amount to pay.');
        console.error('Razorpay Error: Invalid Amount', amount);
        onFailure({ reason: 'Invalid Amount' });
        return;
    }

    // 1. Check for Key
    if (!RAZORPAY_KEY_ID) {
        alert('Payment Configuration Error: Razorpay Key ID is missing. Please check your .env file or Netlify settings.');
        console.error('Razorpay Error: VITE_RAZORPAY_KEY_ID is missing');
        onFailure({ reason: 'Configuration Error: Missing Key' });
        return;
    }

    // 2. Load SDK if needed
    const isLoaded = await initializeRazorpay();
    if (!isLoaded) {
        alert('Payment Error: Failed to load Razorpay SDK. Please check your internet connection and try again.');
        console.error('Razorpay SDK failed to load');
        onFailure({ reason: 'SDK Load Failed' });
        return;
    }

    console.log('Razorpay Init:', { amount, orderData, hasKey: !!RAZORPAY_KEY_ID });

    // 3. Open Modal
    const options = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100), // Ensure integer paise
        currency: 'INR',
        name: 'Divine Guidance Studio',
        description: orderData.desc || 'Order Payment',
        image: '/icons/icon-192x192.png',
        handler: function (response: any) {
            console.log('Razorpay Success:', response);
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
            color: '#f43f5e',
        },
        modal: {
            ondismiss: function () {
                console.log('Razorpay Dismissed');
                onFailure({ reason: 'Payment Cancelled by User' });
            }
        }
    };

    try {
        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
    } catch (err: any) {
        console.error('Razorpay Initialization Failed:', err);
        alert('Something went wrong initializing payment: ' + (err.message || err));
        onFailure(err);
    }
};
