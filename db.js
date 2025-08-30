const DB_NAME = 'fin-db';
const DB_VER = 1;

const openDB = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('transactions')) {
        const s = db.createObjectStore('transactions', { keyPath: 'id' });
        s.createIndex('date', 'date');
        s.createIndex('category', 'category');
        s.createIndex('type', 'type');
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const txStore = async (store, mode='readonly') => {
  const db = await openDB();
  const tx = db.transaction(store, mode);
  return { store: tx.objectStore(store), tx };
};

export const addTx = async (tx) => {
  const { store, tx: t } = await txStore('transactions', 'readwrite');
  store.put(tx);
  return new Promise((res, rej) => { t.oncomplete = () => res(); t.onerror = () => rej(t.error); });
};
export const delTx = async (id) => {
  const { store, tx } = await txStore('transactions', 'readwrite');
  store.delete(id);
  return new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
};
export const allTx = async () => {
  const { store } = await txStore('transactions');
  return new Promise((res, rej) => {
    const out = [];
    const req = store.openCursor(null, 'prev'); 
    req.onsuccess = () => {
      const cur = req.result;
      if (cur) { out.push(cur.value); cur.continue(); } else res(out);
    };
    req.onerror = () => rej(req.error);
  });
};

export const setMeta = async (key, val) => {
  const { store, tx } = await txStore('meta', 'readwrite');
  store.put(val, key);
  return new Promise((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
};
export const getMeta = async (key, fallback) => {
  const { store } = await txStore('meta');
  return new Promise((res) => {
    const req = store.get(key);
    req.onsuccess = () => res(req.result ?? fallback);
    req.onerror = () => res(fallback);
  });
};