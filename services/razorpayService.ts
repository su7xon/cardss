
// @ts-ignore
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export const loadRazorpayScript = (): Promise<boolean> => {
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

// Alias compatible with previous usage if needed, but we encourage specific naming
export const initializeRazorpay = loadRazorpayScript;

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
        image: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png', // Use a reliable public CDN image to avoid 404 issues on local/mobile
        handler: function (response: any) {
            console.log('Razorpay Success:', response);
            onSuccess(response);
        },
        prefill: {
            name: orderData.name,
            email: orderData.email || '',
            contact: orderData.contact ? orderData.contact.replace(/\s+/g, '') : '', // Sanitize contact number
        },
        notes: {
            address: 'Divine Guidance Studio Online',
        },
        theme: {
            color: '#F43F5E', // Use Uppercase HEX just in case
        },
        // Remove 'modal' ondismiss handler for now as it might be triggering prematurely on mobile
        retry: {
            enabled: false // Disable retry to see if it simplifies the flow
        }
    };

    try {
        const paymentObject = new (window as any).Razorpay(options);

        // Add specific error handling for open()
        paymentObject.on('payment.failed', function (response: any) {
            console.error('Payment Failed Event:', response.error);
            alert('Payment Failed: ' + response.error.description);
            onFailure(response.error);
        });

        paymentObject.open();
    } catch (err: any) {
        console.error('Razorpay Initialization Failed:', err);
        alert('Something went wrong initializing payment: ' + (err.message || err));
        onFailure(err);
    }
};
