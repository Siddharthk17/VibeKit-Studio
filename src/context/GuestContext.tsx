import { createContext, useContext, useState, type ReactNode } from 'react';

interface GuestContextType {
  guestId: string;
}

const GuestContext = createContext<GuestContextType>({ guestId: 'guest' });

export function GuestProvider({ children }: { children: ReactNode }) {
  const [guestId] = useState(() => {
    let id = localStorage.getItem('vibekit_guest_id');
    if (!id) {
      id = 'guest-' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('vibekit_guest_id', id);
    }
    return id;
  });

  return (
    <GuestContext.Provider value={{ guestId }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  return useContext(GuestContext);
}
