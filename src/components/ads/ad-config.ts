/**
 * ad-config.ts — Central Advertising Configuration
 * 
 * Invariant: If enabled is false or client/slot IDs are missing,
 * AdSlot and AdContainer will render NOTHING (zero DOM elements).
 */

export type AdSlotPosition = 
  | 'top-leaderboard'
  | 'below-tool'
  | 'in-content'
  | 'sidebar'
  | 'footer-banner'
  | 'mobile-banner';

export interface AdSlotConfig {
  id: string;
  name: string;
  position: AdSlotPosition;
  minHeight: number; // For Cumulative Layout Shift (CLS) prevention
  maxWidth?: number;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
}

export interface AdNetworkConfig {
  enabled: boolean;
  network: 'adsense' | 'custom';
  adsenseClientId?: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  slots: Record<AdSlotPosition, AdSlotConfig>;
}

export const AD_CONFIG: AdNetworkConfig = {
  // Set to true only when Google AdSense or another network is approved and configured
  enabled: false,
  network: 'adsense',
  adsenseClientId: '', // Configured via deployment or environment when ready

  slots: {
    'top-leaderboard': {
      id: 'slot-top-leaderboard',
      name: 'Top Leaderboard',
      position: 'top-leaderboard',
      minHeight: 90,
      maxWidth: 728,
      format: 'horizontal',
      responsive: true,
    },
    'below-tool': {
      id: 'slot-below-tool',
      name: 'Below Tool Workspace',
      position: 'below-tool',
      minHeight: 120,
      format: 'auto',
      responsive: true,
    },
    'in-content': {
      id: 'slot-in-content',
      name: 'In-Article / In-Guide Content',
      position: 'in-content',
      minHeight: 250,
      format: 'rectangle',
      responsive: true,
    },
    'sidebar': {
      id: 'slot-sidebar',
      name: 'Sidebar Desktop Rail',
      position: 'sidebar',
      minHeight: 600,
      maxWidth: 300,
      format: 'vertical',
      responsive: false,
    },
    'footer-banner': {
      id: 'slot-footer-banner',
      name: 'Above Footer Banner',
      position: 'footer-banner',
      minHeight: 90,
      format: 'horizontal',
      responsive: true,
    },
    'mobile-banner': {
      id: 'slot-mobile-banner',
      name: 'Mobile Anchor Banner',
      position: 'mobile-banner',
      minHeight: 50,
      format: 'horizontal',
      responsive: true,
    },
  },
};

/**
 * Check if a specific ad position is active and ready to render
 */
export function isAdSlotActive(position: AdSlotPosition): boolean {
  return Boolean(
    AD_CONFIG.enabled &&
    AD_CONFIG.adsenseClientId &&
    AD_CONFIG.slots[position]
  );
}
