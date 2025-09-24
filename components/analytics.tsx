"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void
    fbq: (command: string, event: string, data?: any) => void
  }
}

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Google Analytics 4
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

    if (GA_MEASUREMENT_ID) {
      // Load Google Analytics
      const script1 = document.createElement("script")
      script1.async = true
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      document.head.appendChild(script1)

      const script2 = document.createElement("script")
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', {
          page_title: document.title,
          page_location: window.location.href,
        });
      `
      document.head.appendChild(script2)

      // Set up gtag function
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer.push(arguments)
      }
    }

    // Facebook Pixel
    const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

    if (FB_PIXEL_ID) {
      const script = document.createElement("script")
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${FB_PIXEL_ID}');
        fbq('track', 'PageView');
      `
      document.head.appendChild(script)

      // No-script fallback
      const noscript = document.createElement("noscript")
      noscript.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1" />
      `
      document.head.appendChild(noscript)
    }
  }, [])

  useEffect(() => {
    // Track page views
    const url = pathname + searchParams.toString()

    if (typeof window.gtag !== "undefined") {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
        page_path: url,
      })
    }

    if (typeof window.fbq !== "undefined") {
      window.fbq("track", "PageView")
    }
  }, [pathname, searchParams])

  return null
}

// Event tracking functions
export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", eventName, parameters)
  }

  if (typeof window.fbq !== "undefined") {
    window.fbq("track", eventName, parameters)
  }
}

export const trackPurchase = (value: number, currency = "BRL") => {
  trackEvent("purchase", {
    value,
    currency,
  })
}

export const trackViewItem = (itemId: string, itemName: string, category: string, value?: number) => {
  trackEvent("view_item", {
    item_id: itemId,
    item_name: itemName,
    item_category: category,
    value,
  })
}

export const trackAddToCart = (itemId: string, itemName: string, category: string, value?: number) => {
  trackEvent("add_to_cart", {
    item_id: itemId,
    item_name: itemName,
    item_category: category,
    value,
  })
}

export const trackContact = (method: string) => {
  trackEvent("contact", {
    method,
  })
}
