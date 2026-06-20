/**
 * Minimal typing for the Razorpay Checkout widget that we load in the browser
 * via <Script src="https://checkout.razorpay.com/v1/checkout.js">. The script
 * attaches `Razorpay` to `window`; this declares just what we use.
 */
interface RazorpayCheckoutOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

/** Payload passed to the "payment.failed" event handler. */
interface RazorpayFailureResponse {
  error: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: { order_id?: string; payment_id?: string };
  };
}

interface RazorpayCheckoutInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: RazorpayFailureResponse) => void,
  ) => void;
}

interface Window {
  Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
}
