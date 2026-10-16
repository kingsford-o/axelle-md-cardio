import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidSupabaseConfig =
  typeof envUrl === 'string' &&
  typeof envAnonKey === 'string' &&
  (envUrl.startsWith('http://') || envUrl.startsWith('https://')) &&
  !envUrl.includes('your_supabase_project_url') &&
  envAnonKey.trim().length > 10 &&
  !envAnonKey.includes('your_supabase_anon_key');

// Local fallback client that provides identical API surface when Supabase credentials
// are not yet configured, preventing fatal runtime crashes and enabling seamless testing
function createLocalClient() {
  const listeners = new Set();
  const STORAGE_KEY_SESSION = 'kyh_supabase_session';
  const STORAGE_KEY_PROFILES = 'kyh_db_profiles';
  const STORAGE_KEY_JOURNAL = 'kyh_db_journal_entries';
  const STORAGE_KEY_CHALLENGES = 'kyh_db_challenges_progress';
  const STORAGE_KEY_LESSONS = 'kyh_db_lessons_progress';
  const STORAGE_KEY_QUIZZES = 'kyh_db_quiz_results';

  const readStorage = (key, fallback = []) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  };

  const writeStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  };

  const getStoredSession = () => {
    try {
      const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
      if (!sessionStr) return null;
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  };

  const saveSession = (session) => {
    if (session) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
    listeners.forEach((cb) => {
      try {
        cb(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const tableMap = {
    profiles: STORAGE_KEY_PROFILES,
    journal_entries: STORAGE_KEY_JOURNAL,
    challenges_progress: STORAGE_KEY_CHALLENGES,
    lessons_progress: STORAGE_KEY_LESSONS,
    quiz_results: STORAGE_KEY_QUIZZES,
  };

  return {
    isMock: true,
    auth: {
      async getSession() {
        const session = getStoredSession();
        return { data: { session }, error: null };
      },
      async getUser() {
        const session = getStoredSession();
        return { data: { user: session?.user ?? null }, error: null };
      },
      onAuthStateChange(callback) {
        listeners.add(callback);
        const session = getStoredSession();
        setTimeout(() => {
          callback('INITIAL_SESSION', session);
        }, 0);
        return {
          data: {
            subscription: {
              unsubscribe: () => listeners.delete(callback),
            },
          },
        };
      },
      async signInWithPassword({ email, password }) {
        if (!email || !password) {
          return { data: { user: null, session: null }, error: new Error('Please enter both email and password.') };
        }
        const profiles = readStorage(STORAGE_KEY_PROFILES, []);
        const found = profiles.find((p) => p.email?.toLowerCase() === email.toLowerCase());

        const userId = found ? found.id : 'usr_' + Math.random().toString(36).substring(2, 11);
        const user = {
          id: userId,
          email,
          user_metadata: {
            full_name: found?.full_name || email.split('@')[0],
            phone: found?.phone || '',
          },
        };
        const session = {
          access_token: 'mock-token-' + Date.now(),
          user,
          expires_at: Date.now() + 3600 * 1000,
        };

        if (!found) {
          profiles.push({
            id: userId,
            email,
            full_name: user.user_metadata.full_name,
            phone: '',
            points: 150,
            streak: 1,
            created_at: new Date().toISOString(),
          });
          writeStorage(STORAGE_KEY_PROFILES, profiles);
        }

        saveSession(session);
        return { data: { user, session }, error: null };
      },
      async signUp({ email, password, options }) {
        if (!email || !password) {
          return { data: { user: null, session: null }, error: new Error('Email and password are required.') };
        }
        const profiles = readStorage(STORAGE_KEY_PROFILES, []);
        const existing = profiles.find((p) => p.email?.toLowerCase() === email.toLowerCase());
        if (existing) {
          // If already registered in local store, sign them in
          return this.signInWithPassword({ email, password });
        }

        const userId = 'usr_' + Math.random().toString(36).substring(2, 11);
        const fullName = options?.data?.full_name || email.split('@')[0];
        const phone = options?.data?.phone || '';

        const user = {
          id: userId,
          email,
          user_metadata: {
            full_name: fullName,
            phone,
          },
        };
        const session = {
          access_token: 'mock-token-' + Date.now(),
          user,
          expires_at: Date.now() + 3600 * 1000,
        };

        profiles.push({
          id: userId,
          email,
          full_name: fullName,
          phone,
          age: null,
          gender: null,
          activity_level: null,
          points: 100,
          streak: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        writeStorage(STORAGE_KEY_PROFILES, profiles);
        saveSession(session);
        return { data: { user, session }, error: null };
      },
      async signInWithOAuth({ provider = "google" } = {}) {
        const dummyEmail = `${provider}.student@knust.edu.gh`;
        return this.signInWithPassword({ email: dummyEmail, password: "GoogleOAuthPassword123!" });
      },
      async signOut() {
        saveSession(null);
        return { error: null };
      },
      async resetPasswordForEmail() {
        return { data: {}, error: null };
      },
    },
    from(tableName) {
      const storageKey = tableMap[tableName] || `kyh_db_${tableName}`;
      let records = readStorage(storageKey, []);
      let filters = [];
      let isSingle = false;

      const builder = {
        select() {
          return builder;
        },
        eq(column, value) {
          filters.push((item) => String(item[column]) === String(value));
          return builder;
        },
        order(column, { ascending = true } = {}) {
          records.sort((a, b) => {
            if (a[column] < b[column]) return ascending ? -1 : 1;
            if (a[column] > b[column]) return ascending ? 1 : -1;
            return 0;
          });
          return builder;
        },
        single() {
          isSingle = true;
          return builder;
        },
        maybeSingle() {
          isSingle = true;
          return builder;
        },
        async then(resolve) {
          let result = records.filter((item) => filters.every((f) => f(item)));
          if (isSingle) {
            resolve({ data: result[0] || null, error: null });
          } else {
            resolve({ data: result, error: null });
          }
        },
        async insert(items) {
          const list = Array.isArray(items) ? items : [items];
          const newRows = list.map((item) => ({
            id: item.id || 'id_' + Math.random().toString(36).substring(2, 10),
            created_at: item.created_at || new Date().toISOString(),
            ...item,
          }));
          const current = readStorage(storageKey, []);
          const updated = [...newRows, ...current];
          writeStorage(storageKey, updated);
          return { data: isSingle ? newRows[0] : newRows, error: null };
        },
        async update(updates) {
          const current = readStorage(storageKey, []);
          const updated = current.map((item) => {
            if (filters.every((f) => f(item))) {
              return { ...item, ...updates, updated_at: new Date().toISOString() };
            }
            return item;
          });
          writeStorage(storageKey, updated);
          return { data: updates, error: null };
        },
        async upsert(item, { onConflict = 'id' } = {}) {
          const current = readStorage(storageKey, []);
          const index = current.findIndex((row) => String(row[onConflict]) === String(item[onConflict]));
          if (index >= 0) {
            current[index] = { ...current[index], ...item, updated_at: new Date().toISOString() };
          } else {
            current.push({
              id: item.id || 'id_' + Math.random().toString(36).substring(2, 10),
              created_at: new Date().toISOString(),
              ...item,
            });
          }
          writeStorage(storageKey, current);
          return { data: item, error: null };
        },
        async delete() {
          const current = readStorage(storageKey, []);
          const remaining = current.filter((item) => !filters.every((f) => f(item)));
          writeStorage(storageKey, remaining);
          return { data: null, error: null };
        },
      };

      return builder;
    },
  };
}

export const supabase = isValidSupabaseConfig
  ? createClient(envUrl, envAnonKey)
  : createLocalClient();

export const isLiveSupabase = isValidSupabaseConfig;
