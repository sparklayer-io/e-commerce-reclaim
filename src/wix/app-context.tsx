import React, { FC } from 'react';

export type AppContextValue = { defineAppMode: boolean };
export const AppContext = React.createContext<AppContextValue>({ defineAppMode: false });

export const useAppContext = (): AppContextValue => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within a AppContextProvider');
    }
    return context;
};

export interface AppContextProviderProps extends React.PropsWithChildren {
    defineAppMode: boolean;
}

export const AppContextProvider: FC<AppContextProviderProps> = ({ defineAppMode, children }) => {
    return <AppContext.Provider value={{ defineAppMode }}>{children}</AppContext.Provider>;
};
