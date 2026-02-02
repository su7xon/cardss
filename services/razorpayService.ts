
// @ts-ignore
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

// Detect In-App Browsers (Instagram, Facebook, etc)
const isInAppBrowser = () => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1) || (ua.indexOf("Instagram") > -1);
};

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

export const initializeRazorpay = loadRazorpayScript;

export const openPaymentModal = async (
    amount: number,
    orderData: { name: string; email?: string; contact: string; desc?: string },
    onSuccess: (response: any) => void,
    onFailure: (error: any) => void
) => {

    // 0. Check In-App Browser
    if (isInAppBrowser()) {
        alert("⚠️ Payment may fail inside Instagram/Facebook browser.\n\nPlease tap '...' and select 'Open in Chrome/Safari' to pay successfully.");
        // We continue anyway, but the alert warns them.
    }

    // 1. Validate Amount
    if (!amount || amount <= 0 || isNaN(amount) || !isFinite(amount)) {
        alert(`Error: Invalid payment amount (₹${amount}). Please clear cart and try again.`);
        onFailure({ reason: 'Invalid Amount', amount });
        return;
    }

    // 2. Check for Key
    if (!RAZORPAY_KEY_ID) {
        alert('Payment Configuration Error: Razorpay Key ID is missing. Please check your .env file or Netlify settings.');
        onFailure({ reason: 'Configuration Error: Missing Key' });
        return;
    }

    // 3. Load SDK
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
        alert('Payment Error: Failed to load Razorpay SDK. Please check your internet connection.');
        onFailure({ reason: 'SDK Load Failed' });
        return;
    }

    console.log('Razorpay Init:', { amount, hasKey: !!RAZORPAY_KEY_ID });

    // 4. Open Modal (Minimal Config for Stability)
    const options = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'Divine Guidance Studio',
        description: orderData.desc || 'Order Payment',
        // image: Removed to prevent mobile loading issues
        handler: function (response: any) {
            console.log('Razorpay Success:', response);
            onSuccess(response);
        },
        // prefill: {
        //    contact: orderData.contact ? orderData.contact.replace(/\D/g, '') : '',
        // },
        theme: {
            color: '#F43F5E',
        },
        modal: {
            ondismiss: function () {
                console.log('Razorpay Dismissed');
                onFailure({ reason: 'Payment Cancelled by User' });
            }
        },
        retry: {
            enabled: false
        }
    };

    try {
        const paymentObject = new (window as any).Razorpay(options);

        paymentObject.on('payment.failed', function (response: any) {
            console.error('Payment Failed Event:', response.error);
            // DEBUG: Show full error details
            alert(`Payment Failed Details:\nCode: ${response.error.code}\nReason: ${response.error.reason}\nDesc: ${response.error.description || 'No Description'}\nSource: ${response.error.source}\nStep: ${response.error.step}`);
            onFailure(response.error);
        });

        paymentObject.open();
    } catch (err: any) {
        console.error('Razorpay Initialization Failed:', err);
        alert('Something went wrong initializing payment: ' + (err.message || err));
        onFailure(err);
    }
};
