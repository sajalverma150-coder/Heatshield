import { UserHealthProfile } from '../types';

/**
 * Returns today's date in 'YYYY-MM-DD' format based on local timezone.
 */
export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if the user profile's last hydration log date matches today.
 * If a new day has started, resets hydrationTodayMl to 0 and updates lastHydrationDate to today's date.
 */
export const checkAndResetDailyHydration = (profile: UserHealthProfile): UserHealthProfile => {
  const today = getTodayDateString();
  if (profile.lastHydrationDate !== today) {
    return {
      ...profile,
      hydrationTodayMl: 0,
      lastHydrationDate: today,
      lastWaterLogTime: profile.lastHydrationDate ? 'Not logged today' : profile.lastWaterLogTime,
      lastWaterLogTimestamp: undefined,
    };
  }
  return profile;
};
