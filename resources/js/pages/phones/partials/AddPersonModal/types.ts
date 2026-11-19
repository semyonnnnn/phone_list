import { Department } from '@/pages/phones/types';
import { TerritoryKey } from '@/types';

export interface AddPersonModalProps {
    department: Department | null;
    isOpen: boolean;
    onClose: () => void;
}

export type AddPersonUseFormType = {
    department_id: number | null;
    person: string;
    phone: string;
    extension: string;
    cabinet: string;
    ip: string;
    isBoss: boolean;
    isMiniBoss: boolean;
    territory: TerritoryKey;
};
