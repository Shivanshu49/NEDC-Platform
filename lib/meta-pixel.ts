/** Meta (Facebook) Pixel ID — not a secret; it ships to every visitor. */
export const META_PIXEL_ID = "27401627166157705";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Official Meta Pixel bootstrap. Lives in the root <head> as a raw <script>
 * so Meta's Events Manager crawler (which does not run React) can see
 * fbq('init', …) in the first HTML response. next/script afterInteractive
 * hid this in a client chunk, which is why the dashboard reported
 * "A pixel wasn't detected".
 */
export const META_PIXEL_SNIPPET = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`;
