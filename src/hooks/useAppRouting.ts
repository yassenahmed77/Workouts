'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@/types';
import { ClientDetailSubTab } from '@/components/coach/client-detail/ClientDetailView';
import { sanitizeString } from '@/lib/sanitizer';

export const COACH_TABS = [
  'dashboard',
  'splits-studio',
  'clients',
  'competitors',
  'diet',
  'exercises',
  'alerts',
  'calendar',
  'settings'
] as const;

export const TRAINEE_TABS = [
  'today',
  'split',
  'habits',
  'history',
  'profile'
] as const;

export type CoachTab = typeof COACH_TABS[number];
export type TraineeTab = typeof TRAINEE_TABS[number];
export type AppTab = CoachTab | TraineeTab | string;

export const VALID_CLIENT_SUB_TABS: ClientDetailSubTab[] = [
  'overview',
  'checkins',
  'workout',
  'nutrition',
  'logs',
  'notes',
  'timeline'
];

interface UseAppRoutingProps {
  currentUser: User | null;
  users: User[];
  isLoaded: boolean;
}

/**
 * Headless URL Routing & Deep-Linking Engine (Clean Architecture - Layer 2).
 * 
 * Provides instantaneous, two-way URL state synchronization:
 * - Full browser Back/Forward (popstate) native support for mobile gestures.
 * - Deep-linking directly to tabs, specific athletes (?tab=clients&clientId=...&subTab=...), and protocols.
 * - Zero full-page reload overhead, preserving active workout drafts and live timers.
 * - Strict multi-tenant safety and URL sanitization.
 */
export function useAppRouting({ currentUser, users, isLoaded }: UseAppRoutingProps) {
  // Determine default tab based on user role
  const defaultTab = useMemo(() => {
    return currentUser?.role === 'coach' ? 'dashboard' : 'today';
  }, [currentUser?.role]);

  const [activeTab, setActiveTabState] = useState<string>(defaultTab);
  const [selectedClientFor360, setSelectedClientFor360] = useState<User | null>(null);
  const [clientDetailInitialSubTab, setClientDetailInitialSubTab] = useState<ClientDetailSubTab>('overview');

  /**
   * Helper to build safe query string
   */
  const buildUrl = useCallback((tab: string, clientId?: string, subTab?: string) => {
    const params = new URLSearchParams();
    if (tab) params.set('tab', tab);
    if (clientId) params.set('clientId', clientId);
    if (subTab && subTab !== 'overview') params.set('subTab', subTab);
    const queryString = params.toString();
    return queryString ? `/?${queryString}` : '/';
  }, []);

  /**
   * Safe URL parser that validates against allowed tabs for current role
   */
  const parseCurrentUrl = useCallback(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const rawTab = params.get('tab');
    const rawClientId = params.get('clientId');
    const rawSubTab = params.get('subTab');

    const cleanTab = rawTab ? sanitizeString(rawTab).toLowerCase() : '';
    const isCoach = currentUser?.role === 'coach';

    let targetTab = defaultTab;

    if (isCoach) {
      if (COACH_TABS.includes(cleanTab as CoachTab)) {
        targetTab = cleanTab;
      }
    } else {
      if (TRAINEE_TABS.includes(cleanTab as TraineeTab)) {
        targetTab = cleanTab;
      }
    }

    setActiveTabState(targetTab);

    // If client 360 is targeted in URL
    if (targetTab === 'clients' && rawClientId) {
      const cleanClientId = sanitizeString(rawClientId);
      const targetUser = users.find((u) => u.id === cleanClientId) || null;
      setSelectedClientFor360(targetUser);

      if (rawSubTab && VALID_CLIENT_SUB_TABS.includes(rawSubTab as ClientDetailSubTab)) {
        setClientDetailInitialSubTab(rawSubTab as ClientDetailSubTab);
      } else {
        setClientDetailInitialSubTab('overview');
      }
    } else {
      setSelectedClientFor360(null);
    }
  }, [currentUser?.role, defaultTab, users]);

  /**
   * Navigate to a tab and synchronize browser history
   */
  const navigateToTab = useCallback((
    tab: string,
    options?: { replace?: boolean; scroll?: boolean }
  ) => {
    const cleanTab = sanitizeString(tab).toLowerCase();
    setActiveTabState(cleanTab);
    setSelectedClientFor360(null);

    if (typeof window !== 'undefined') {
      const newUrl = buildUrl(cleanTab);
      if (options?.replace) {
        window.history.replaceState({ tab: cleanTab }, '', newUrl);
      } else {
        window.history.pushState({ tab: cleanTab }, '', newUrl);
      }
    }
  }, [buildUrl]);

  /**
   * Navigate directly to a specific Client 360 sub-tab with URL deep-linking
   */
  const navigateToClient360 = useCallback((
    user: User,
    initialSubTab: ClientDetailSubTab = 'overview',
    options?: { replace?: boolean }
  ) => {
    setSelectedClientFor360(user);
    setClientDetailInitialSubTab(initialSubTab);
    setActiveTabState('clients');

    if (typeof window !== 'undefined') {
      const newUrl = buildUrl('clients', user.id, initialSubTab);
      if (options?.replace) {
        window.history.replaceState({ tab: 'clients', clientId: user.id, subTab: initialSubTab }, '', newUrl);
      } else {
        window.history.pushState({ tab: 'clients', clientId: user.id, subTab: initialSubTab }, '', newUrl);
      }
    }
  }, [buildUrl]);

  /**
   * Return from Client 360 to the general clients directory
   */
  const closeClient360 = useCallback((options?: { replace?: boolean }) => {
    setSelectedClientFor360(null);
    setActiveTabState('clients');

    if (typeof window !== 'undefined') {
      const newUrl = buildUrl('clients');
      if (options?.replace) {
        window.history.replaceState({ tab: 'clients' }, '', newUrl);
      } else {
        window.history.pushState({ tab: 'clients' }, '', newUrl);
      }
    }
  }, [buildUrl]);

  // Initial URL parsing on hydration
  useEffect(() => {
    if (isLoaded) {
      parseCurrentUrl();
    }
  }, [isLoaded, parseCurrentUrl]);

  // Listen to native browser Back and Forward navigation (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      parseCurrentUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [parseCurrentUrl]);

  // If user role changes (e.g. switcher), reconcile active tab
  useEffect(() => {
    if (!currentUser || !isLoaded) return;

    const isCoach = currentUser.role === 'coach';
    const isValidTab = isCoach
      ? COACH_TABS.includes(activeTab as CoachTab)
      : TRAINEE_TABS.includes(activeTab as TraineeTab);

    if (!isValidTab) {
      navigateToTab(defaultTab, { replace: true });
    }
  }, [currentUser, isLoaded, activeTab, defaultTab, navigateToTab]);

  return {
    activeTab,
    selectedClientFor360,
    clientDetailInitialSubTab,
    navigateToTab,
    navigateToClient360,
    closeClient360,
    setClientDetailInitialSubTab
  };
}
