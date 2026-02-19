import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'issuer' | 'holder' | 'verifier' | null;

interface SessionState {
  walletAddr: string | null;
  session: string | null;
  role: UserRole;
  isAuthed: boolean;

  signIn: (walletAddr: string, session: string) => void;
  signOut: () => void;
  pickRole: (role: UserRole) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      walletAddr: null,
      session: null,
      role: null,
      isAuthed: false,

      signIn: (walletAddr, session) =>
        set({ walletAddr, session, isAuthed: true }),

      signOut: () =>
        set({ walletAddr: null, session: null, role: null, isAuthed: false }),

      pickRole: (role) => set({ role }),
    }),
    {
      name: 'cloakstamp-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        walletAddr: state.walletAddr,
        session: state.session,
        role: state.role,
        isAuthed: state.isAuthed,
      }),
    }
  )
);
