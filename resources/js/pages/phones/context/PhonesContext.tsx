import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GlobalTerritoryKey } from '@/types';

interface PhoneContextType {
    globalTerritoryValue: GlobalTerritoryKey;
    setGlobalTerritoryValue: React.Dispatch<React.SetStateAction<GlobalTerritoryKey>>;
}

const PhoneContext = createContext<PhoneContextType | undefined>(undefined);

interface PhoneProviderProps {
    children: ReactNode;
    initialTerritory?: GlobalTerritoryKey;
}

export function PhoneProvider({
    children,
    initialTerritory = 'all'
}: PhoneProviderProps) {
    const [globalTerritoryValue, setGlobalTerritoryValue] = useState<GlobalTerritoryKey>(
        initialTerritory
    );

    return (
        <PhoneContext.Provider
            value={{
                globalTerritoryValue,
                setGlobalTerritoryValue,
            }}
        >
            {children}
        </PhoneContext.Provider>
    );
}

export function usePhoneContext() {
    const context = useContext(PhoneContext);

    if (!context) {
        throw new Error('usePhoneContext must be used within a PhoneProvider');
    }

    return context;
}
