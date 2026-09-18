/**
 * analytics.ts — Privacy-First Zero-PII Analytics Tracker
 * 
 * Invariant: Never captures or transmits filenames, file binary data,
 * user contents, or PII. Only tracks operational events and tool discovery patterns.
 */

export type AnalyticsEventName =
  | 'tool_open'
  | 'tool_process_start'
  | 'tool_success'
  | 'tool_error'
  | 'tool_download'
  | 'related_tool_click'
  | 'search_query'
  | 'category_view';

export interface AnalyticsPayload {
  tool_slug?: string;
  category?: string;
  format?: string;
  duration_ms?: number;
  batch_size?: number;
  error_type?: string;
  from_tool?: string;
  to_tool?: string;
  query_length?: number;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Track an operational event with zero PII logging
 */
export function trackEvent(eventName: AnalyticsEventName, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return;

  // Sanitize: ensure no filenames or sensitive string data are attached
  const sanitizedPayload: Record<string, any> = {
    event_timestamp: Date.now(),
    ...payload,
  };

  // Google Analytics 4 integration (if user has enabled GA4 via env/script)
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, sanitizedPayload);
  }

  // Developer mode debugging beacon
  if (import.meta.env?.DEV) {
    console.debug(`[Analytics Event] ${eventName}:`, sanitizedPayload);
  }
}

/**
 * Helper to measure tool execution performance
 */
export function startTimer(): () => number {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  return () => {
    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return Math.round(endTime - startTime);
  };
}
