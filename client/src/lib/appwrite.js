import { Client, Account, Databases, ID, Query } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'axelle_cardio';

export const COLLECTIONS = {
  PROFILES: import.meta.env.VITE_APPWRITE_COLLECTION_PROFILES || 'profiles',
  JOURNAL_ENTRIES: import.meta.env.VITE_APPWRITE_COLLECTION_JOURNAL || 'journal_entries',
  CHALLENGES_PROGRESS: import.meta.env.VITE_APPWRITE_COLLECTION_CHALLENGES || 'challenges_progress',
  LESSONS_PROGRESS: import.meta.env.VITE_APPWRITE_COLLECTION_LESSONS || 'lessons_progress',
  QUIZ_RESULTS: import.meta.env.VITE_APPWRITE_COLLECTION_QUIZ || 'quiz_results',
  HEART_RATE_LOGS: import.meta.env.VITE_APPWRITE_COLLECTION_HEART_RATE || 'heart_rate_logs',
};

const isLiveConfig =
  typeof projectId === 'string' &&
  projectId.trim().length > 3 &&
  !projectId.includes('your_appwrite_project_id');

// Fallback local storage implementation for offline development and testing
function createMockAppwrite() {
  const STORAGE_KEY_USER = 'kyh_appwrite_user';
  const STORAGE_KEY_PROFILES = 'kyh_appwrite_profiles';
  const STORAGE_KEY_JOURNAL = 'kyh_appwrite_journal';

  const read = (key, fallback = []) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  };

  const write = (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  };

  const account = {
    async get() {
      const user = read(STORAGE_KEY_USER, null);
      if (!user) {
        throw new Error('No active Appwrite session');
      }
      return user;
    },
    async create(userId, email, password, name) {
      const id = userId === 'unique()' ? 'usr_' + Math.random().toString(36).substring(2, 10) : userId;
      const user = {
        $id: id,
        email,
        name: name || email.split('@')[0],
        status: true,
        emailVerification: false,
        prefs: {},
      };
      return user;
    },
    async createEmailPasswordSession(email, password) {
      if (!email || !password) {
        throw new Error('Email and password are required.');
      }
      const profiles = read(STORAGE_KEY_PROFILES, []);
      const found = profiles.find((p) => p.email?.toLowerCase() === email.toLowerCase());

      const user = {
        $id: found ? found.userId : 'usr_' + Math.random().toString(36).substring(2, 10),
        email,
        name: found?.fullName || email.split('@')[0],
        status: true,
        prefs: {},
      };

      if (!found) {
        profiles.push({
          $id: 'doc_' + Math.random().toString(36).substring(2, 10),
          userId: user.$id,
          email,
          fullName: user.name,
          phone: '',
          points: 150,
          streak: 1,
          createdAt: new Date().toISOString(),
        });
        write(STORAGE_KEY_PROFILES, profiles);
      }

      write(STORAGE_KEY_USER, user);
      return {
        $id: 'session_' + Math.random().toString(36).substring(2, 10),
        userId: user.$id,
        expire: new Date(Date.now() + 86400 * 1000).toISOString(),
      };
    },
    async deleteSession() {
      localStorage.removeItem(STORAGE_KEY_USER);
      return { status: true };
    },
    async createOAuth2Session() {
      return this.createEmailPasswordSession('knust.student@knust.edu.gh', 'AppwriteDemo123!');
    },
    async createRecovery() {
      return { status: true };
    },
  };

  const databases = {
    async listDocuments(dbId, colId, queries = []) {
      const storageKey = colId === COLLECTIONS.JOURNAL_ENTRIES ? STORAGE_KEY_JOURNAL : STORAGE_KEY_PROFILES;
      let list = read(storageKey, []);

      // Basic query matching
      queries.forEach((q) => {
        if (typeof q === 'string' && q.startsWith('equal("userId",')) {
          const match = q.match(/equal\("userId",\s*\[?"?([^"\]]+)"?\]?\)/);
          if (match && match[1]) {
            const uid = match[1];
            list = list.filter((item) => item.userId === uid);
          }
        }
      });

      return { total: list.length, documents: list };
    },
    async getDocument(dbId, colId, docId) {
      const storageKey = colId === COLLECTIONS.JOURNAL_ENTRIES ? STORAGE_KEY_JOURNAL : STORAGE_KEY_PROFILES;
      const list = read(storageKey, []);
      const doc = list.find((d) => d.$id === docId);
      if (!doc) throw new Error('Document not found');
      return doc;
    },
    async createDocument(dbId, colId, docId, data) {
      const storageKey = colId === COLLECTIONS.JOURNAL_ENTRIES ? STORAGE_KEY_JOURNAL : STORAGE_KEY_PROFILES;
      const list = read(storageKey, []);
      const newDoc = {
        $id: docId === 'unique()' ? 'doc_' + Math.random().toString(36).substring(2, 10) : docId,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        ...data,
      };
      list.unshift(newDoc);
      write(storageKey, list);
      return newDoc;
    },
    async updateDocument(dbId, colId, docId, data) {
      const storageKey = colId === COLLECTIONS.JOURNAL_ENTRIES ? STORAGE_KEY_JOURNAL : STORAGE_KEY_PROFILES;
      const list = read(storageKey, []);
      const index = list.findIndex((d) => d.$id === docId || d.userId === docId);
      if (index >= 0) {
        list[index] = { ...list[index], ...data, $updatedAt: new Date().toISOString() };
        write(storageKey, list);
        return list[index];
      }
      return { $id: docId, ...data };
    },
    async deleteDocument(dbId, colId, docId) {
      const storageKey = colId === COLLECTIONS.JOURNAL_ENTRIES ? STORAGE_KEY_JOURNAL : STORAGE_KEY_PROFILES;
      const list = read(storageKey, []);
      const filtered = list.filter((d) => d.$id !== docId);
      write(storageKey, filtered);
      return { status: true };
    },
  };

  return {
    client: null,
    account,
    databases,
    isMock: true,
  };
}

let clientInstance = null;
let accountInstance;
let databasesInstance;
let isMockClient = false;

if (isLiveConfig) {
  clientInstance = new Client();
  clientInstance.setEndpoint(endpoint).setProject(projectId);
  accountInstance = new Account(clientInstance);
  databasesInstance = new Databases(clientInstance);
} else {
  const mock = createMockAppwrite();
  accountInstance = mock.account;
  databasesInstance = mock.databases;
  isMockClient = true;
}

export const client = clientInstance;
export const account = accountInstance;
export const databases = databasesInstance;
export const isAppwriteLive = !isMockClient;
export const APPWRITE_DATABASE_ID = databaseId;
export { ID, Query };
