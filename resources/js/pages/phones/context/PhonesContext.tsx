import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GlobalTerritoryKey } from '@/types';
import { ActivePicker, PickerColumn } from '@/pages/phones/types';

interface PhoneContextType {
    globalTerritoryValue: GlobalTerritoryKey;
    setGlobalTerritoryValue: React.Dispatch<React.SetStateAction<GlobalTerritoryKey>>;
    activePicker: ActivePicker;
    togglePicker: (depKey: string | number, column: PickerColumn) => void;
    closePicker: () => void;
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
    const [activePicker, setActivePicker] = useState<ActivePicker>(null);

    const togglePicker = (depKey: string | number, column: PickerColumn) => {
        setActivePicker((prev) =>
            prev?.depKey === depKey && prev?.column === column ? null : { depKey, column }
        );
    };

    const closePicker = () => setActivePicker(null);

    return (
        <PhoneContext.Provider
            value={{
                globalTerritoryValue,
                setGlobalTerritoryValue,
                activePicker,
                togglePicker,
                closePicker,
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
