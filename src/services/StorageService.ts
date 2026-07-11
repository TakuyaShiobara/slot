import { DEFAULT_SAVE, SAVE_VERSION, type SaveData } from '@/models/SaveData';

const STORAGE_KEY = 'original-slot-pwa.save';

/** LocalStorageへのセーブデータ読み書きを一手に担うサービス。 */
export class StorageService {
  load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE };
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      if (parsed.version !== SAVE_VERSION) {
        return { ...DEFAULT_SAVE };
      }
      return { ...DEFAULT_SAVE, ...parsed };
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }

  save(data: SaveData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // LocalStorageが利用できない環境（プライベートモード等）では保存を諦める。
    }
  }

  reset(): SaveData {
    const fresh = { ...DEFAULT_SAVE };
    this.save(fresh);
    return fresh;
  }
}

export const storageService = new StorageService();
