import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
///////////////////////////////////////////////
import { AddPersonUseFormType } from '@/pages/phones/partials/AddPersonModal/types';
import { Department } from '../DepCard/types';
interface useAddPersonModalProps {
    department: Department | null;
    onClose: () => void;
}

export const useAddPersonModal = ({ department, onClose }: useAddPersonModalProps) => {
    const departmentHasBoss = department?.phones.some((p) => Boolean(p.isBoss)) ?? false;

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<AddPersonUseFormType>({
        department_id: null,
        person: '',
        phone: '',
        extension: '',
        cabinet: '',
        ip: '',
        territory: 'ekb',
        isBoss: false as boolean,
        isMiniBoss: false as boolean,
    });

    useEffect(() => {
        if (department) {
            clearErrors();
            setData({
                department_id: department.group.id,
                person: '',
                phone: '',
                extension: '',
                cabinet: '',
                ip: '',
                territory: department.group.territory,
                isBoss: false,
                isMiniBoss: false,
            });
        }
    }, [department]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('phones.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleBossToggle = () => {
        if (departmentHasBoss && !data.isBoss) return;
        setData((prev) => ({
            ...prev,
            isBoss: !prev.isBoss,
            isMiniBoss: !prev.isBoss ? false : prev.isMiniBoss,
        }));
    };

    const handleMiniBossToggle = () => {
        setData((prev) => ({
            ...prev,
            isMiniBoss: !prev.isMiniBoss,
            isBoss: !prev.isMiniBoss ? false : prev.isBoss,
        }));
    };

    const buttonBaseClass =
        'relative bg-white text-[#111] border border-[#ccc] px-4 py-2 text-[0.95rem] font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-[3px_3px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all duration-100';

    const buttonStyle = {
        fontFamily: '"Courier New", Courier, monospace',
        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
        borderRadius: 0,
    } as const;

    return {
        handleSubmit,
        data,
        errors,
        handleMiniBossToggle,
        setData,
        handleBossToggle,
        processing,
        departmentHasBoss,
        buttonStyle,
        buttonBaseClass
    };
};
