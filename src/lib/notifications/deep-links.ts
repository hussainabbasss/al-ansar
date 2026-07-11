import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { PluginListenerHandle } from "@capacitor/core";

type RouterLike = { push: (href: string) => void };

let handle: PluginListenerHandle | null = null;

/**
 * Navigate when a local notification with extra.href is tapped.
 */
export async function attachNotificationDeepLinks(
  router: RouterLike,
): Promise<() => void> {
  if (!Capacitor.isNativePlatform()) return () => undefined;

  try {
    if (handle) {
      await handle.remove();
      handle = null;
    }

    handle = await LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (event) => {
        const href = event.notification.extra?.href;
        if (typeof href === "string" && href.startsWith("/")) {
          router.push(href);
        }
      },
    );
  } catch {
    return () => undefined;
  }

  return async () => {
    try {
      await handle?.remove();
    } catch {
      // ignore
    }
    handle = null;
  };
}
