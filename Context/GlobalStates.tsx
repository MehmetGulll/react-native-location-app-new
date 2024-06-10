import React, { createContext, useState, ReactNode } from "react";

interface ContextProps {
  userStatus: number | null;
  setUserStatus: React.Dispatch<React.SetStateAction<number | null>>;
  userId: number | null;
  setUserId : React.Dispatch<React.SetStateAction<number | null>>;
}

export const GlobalContext = createContext<ContextProps>({
  userStatus: null,
  setUserStatus: () => {},
  userId : null,
  setUserId : ()=>{}
});

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [userStatus, setUserStatus] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  return (
    <GlobalContext.Provider value={{ userStatus, setUserStatus, userId, setUserId }}>
      {children}
    </GlobalContext.Provider>
  );
};
