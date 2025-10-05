/**
 * Tab System - Central Export
 * Exports all tab-related functionality for easy imports
 */

export { useTabNavigation } from './use-tab-navigation'

export {
  TAB_ACCESS_MAP,
  hasAccessToPath,
  getAccessiblePaths,
  getTabConfig,
} from './tab-access-map'
export type { TabAccessConfig } from './tab-access-map'
