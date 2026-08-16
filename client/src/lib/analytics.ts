type AnalyticsValue = string | number | boolean;

type UmamiWindow = Window & {
  umami?: {
    track: (eventName: string, data?: Record<string, AnalyticsValue>) => void;
  };
};

export function trackPropertyFilter(event: string, data: Record<string, AnalyticsValue>) {
  if (typeof window === "undefined") return;
  const analyticsWindow = window as UmamiWindow;
  analyticsWindow.umami?.track(event, data);
}
