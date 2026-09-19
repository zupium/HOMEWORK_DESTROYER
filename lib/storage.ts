import { Book } from './types';

const DB_NAME = 'bukupintar_db';
const STORE_NAME = 'custom_books';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB tidak didukung oleh browser ini.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Mengambil semua buku kustom yang tersimpan di IndexedDB browser.
 * Jika ada data lama di localStorage, otomatis dimigrasikan ke IndexedDB.
 */
export async function getStoredCustomBooks(): Promise<Book[]> {
  try {
    const db = await openDB();
    const booksFromDb = await new Promise<Book[]>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    if (booksFromDb.length > 0) {
      return booksFromDb;
    }

    // Periksa apakah ada data di localStorage dari versi terdahulu
    const legacy = localStorage.getItem('bukupintar_custom_books');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migrasi ke IndexedDB
          for (const book of parsed) {
            await saveStoredCustomBook(book);
          }
          return parsed;
        }
      } catch {
        // Abaikan parse error
      }
    }

    return [];
  } catch (e) {
    console.warn('Fallback ke localStorage untuk memuat buku kustom:', e);
    try {
      const saved = localStorage.getItem('bukupintar_custom_books');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}

/**
 * Menyimpan buku baru ke IndexedDB (kapasitas ratusan MB, tidak terkena batas 5MB localStorage).
 */
export async function saveStoredCustomBook(book: Book): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(book);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Gagal menyimpan ke IndexedDB, mencoba fallback localStorage:', e);
    try {
      const current = await getStoredCustomBooks();
      const updated = [...current.filter(b => b.id !== book.id), book];
      localStorage.setItem('bukupintar_custom_books', JSON.stringify(updated));
    } catch (lsErr) {
      console.error('Storage quota exceeded:', lsErr);
    }
  }
}

/**
 * Menghapus buku kustom dari IndexedDB
 */
export async function deleteStoredCustomBook(bookId: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(bookId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Gagal menghapus dari IndexedDB:', e);
    try {
      const current = await getStoredCustomBooks();
      const updated = current.filter(b => b.id !== bookId);
      localStorage.setItem('bukupintar_custom_books', JSON.stringify(updated));
    } catch {}
  }
}
