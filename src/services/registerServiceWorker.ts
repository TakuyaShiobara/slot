import { registerSW } from 'virtual:pwa-register';

/** PWAのService Workerを登録し、オフライン起動とホーム画面追加に対応させる。 */
export function registerServiceWorker(): void {
  registerSW({ immediate: true });
}
