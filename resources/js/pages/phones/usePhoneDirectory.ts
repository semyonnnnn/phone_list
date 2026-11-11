import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import { PhoneRecord, PageProps, DepartmentOption, PhoneForm } from './types';
import { DEFAULT_TERRITORY, TerritoryKey, GlobalTerritoryKey } from '@/types';

export function usePhoneDirectory(
    initialDeps: PageProps['departments'],
    filters: PageProps['filters'],
    flash: PageProps['flash'],
    allGroups?: PageProps['allGroups']
) {
    const [originalDeps, setOriginalDeps] = useState(initialDeps);
    const [selectedOption, setSelectedOption] = useState(filters?.department ?? 'Все отделы');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 'all' means no territory filter. Separate from data.territory (the upload
    // target), which must always be a real TerritoryKey.
    // Starts from what the server applied, so a reload or a pagination link keeps the filter.
    // Explicit generic: without it TypeScript infers a wide type from the fallback.
    const [globalTerritoryValue, setGlobalTerritoryValue] = useState<GlobalTerritoryKey>(
        filters?.territory ?? 'all'
    );

    const [showSuccess, setShowSuccess] = useState(false);
    const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const popupStartedAtRef = useRef<number>(0);
    const popupRemainingRef = useRef(4000);

    // Show the popup when the server sends a success flash, and hide it after 4 s.
    // pausePopupTimer/resumePopupTimer below rely on the refs set here.
    useEffect(() => {
        if (!flash?.success) return;

        setShowSuccess(true);

        popupRemainingRef.current = 4000;
        popupStartedAtRef.current = Date.now();

        popupTimerRef.current = setTimeout(() => {
            setShowSuccess(false);
            popupTimerRef.current = null;
        }, popupRemainingRef.current);

        return () => {
            if (popupTimerRef.current) {
                clearTimeout(popupTimerRef.current);
                popupTimerRef.current = null;
            }
        };
    }, [flash?.success]);

    const pausePopupTimer = () => {
        if (!popupTimerRef.current) return;

        clearTimeout(popupTimerRef.current);
        popupTimerRef.current = null;

        const elapsed = Date.now() - popupStartedAtRef.current;

        popupRemainingRef.current = Math.max(
            0,
            popupRemainingRef.current - elapsed
        );
    };

    const resumePopupTimer = () => {
        if (popupRemainingRef.current <= 0) {
            setShowSuccess(false);
            return;
        }

        popupStartedAtRef.current = Date.now();

        popupTimerRef.current = setTimeout(() => {
            setShowSuccess(false);
            popupTimerRef.current = null;
        }, popupRemainingRef.current);
    };

    const { data, setData, put, processing, errors, clearErrors } = useForm<PhoneForm>({
        departments: initialDeps,
        territory: DEFAULT_TERRITORY,
    });
    const errorBag = errors as unknown as Record<string, string>;
    const page = usePage();
    const pageErrors = (page.props as unknown as { errors?: Record<string, string> }).errors;

    useEffect(() => {
        if (!initialDeps) return;
        if (pageErrors && Object.keys(pageErrors).length > 0) return;

        setData('departments', initialDeps);
        setOriginalDeps(JSON.parse(JSON.stringify(initialDeps)));
    }, [initialDeps]);

    const handleBossChange = (
        depIndex: number,
        targetRowIndex: number
    ) => {
        const updatedDeps = data.departments.map((dep, currentDepIndex) => {
            if (currentDepIndex !== depIndex) {
                return dep;
            }

            return {
                ...dep,
                phones: dep.phones.map((phone, currentRowIndex) => ({
                    ...phone,
                    isBoss: currentRowIndex === targetRowIndex,
                })),
            };
        });

        setData('departments', updatedDeps);
    };

    const handleTerritoryUpload = (territory: TerritoryKey) => {
        fileInputRef.current?.click();
        setData('territory', territory);
    };

    const onChangeGlobalTerritoryValue = (value: GlobalTerritoryKey) => {
        setGlobalTerritoryValue(value);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentSearch = filters?.search ?? '';
            const currentDep = filters?.department ?? 'Все отделы';
            const currentTerritory = filters?.territory ?? 'all';

            if (searchQuery !== currentSearch ||
                selectedOption !== currentDep ||
                globalTerritoryValue !== currentTerritory
            ) {
                router.get(
                    route('phones.index'),
                    {
                        search: searchQuery,
                        department: selectedOption === 'Все отделы' ? '' : selectedOption,
                        territory: globalTerritoryValue
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    }
                );
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedOption, globalTerritoryValue]);

    const hasChanges = useMemo(
        () => JSON.stringify(data.departments) !== JSON.stringify(originalDeps),
        [data.departments, originalDeps]
    );

    const { bossChanged, isMiniBossChanged } = useMemo(() => {
        let boss = false;
        let miniBoss = false;

        data.departments.forEach((dep, depIndex) => {
            const origDep = originalDeps[depIndex];
            if (!origDep) return;

            dep.phones.forEach((phone, phoneIndex) => {
                const origPhone = origDep.phones?.[phoneIndex];
                if (!origPhone) return;

                const currentBoss = Boolean(phone.is_boss ?? phone.nach);
                const origBoss = Boolean(origPhone.is_boss ?? origPhone.nach);
                if (currentBoss !== origBoss) {
                    boss = true;
                }

                const currentZam = Boolean(phone.is_miniboss ?? phone.zam ?? phone.is_zam);
                const origZam = Boolean(origPhone.is_miniboss ?? origPhone.zam ?? origPhone.is_zam);
                if (currentZam !== origZam) {
                    miniBoss = true;
                }
            });
        });

        return { bossChanged: boss, isMiniBossChanged: miniBoss };
    }, [data.departments, originalDeps]);

    const handleDownload = () => {
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = route('files.download');
        form.style.display = 'none';

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        document.body.appendChild(form);
        form.submit();
        form.remove();
    };

    const handleFieldChangeByIndices = (depIndex: number, rowIndex: number, field: keyof PhoneRecord, value: string | boolean) => {
        const updatedDeps = [...data.departments];
        const updatedPhones = [...updatedDeps[depIndex].phones];

        // Normalize empty strings back to null so they match original database state
        const normalizedValue = typeof value === 'string' && value.trim() === '' ? null : value;

        updatedPhones[rowIndex] = {
            ...updatedPhones[rowIndex],
            [field]: normalizedValue,
        };
        updatedDeps[depIndex] = {
            ...updatedDeps[depIndex],
            phones: updatedPhones,
        };
        setData('departments', updatedDeps);

        const errorKey = `departments.${depIndex}.phones.${rowIndex}.${String(field)}`;
        if (errorBag[errorKey]) {
            clearErrors(errorKey as any);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('phones.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setOriginalDeps(JSON.parse(JSON.stringify(data.departments)));
            },
        });
    };

    const handleCancel = () => {
        setData('departments', JSON.parse(JSON.stringify(originalDeps)));
        clearErrors();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('territory', data.territory);

        router.post(route('files.upload'), formData, {
            forceFormData: true,
            onSuccess: () => {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const dropdownOptions: DepartmentOption[] = [
        {
            label: 'Все отделы',
            // id 0 is a placeholder: "all departments" isn't a real group.
            value: { id: 0, name: '', territory: DEFAULT_TERRITORY },
        },
        ...(allGroups || []).map((group) => ({
            label: group.name,
            // The group already has the shape DepartmentOption expects,
            // so there is no manual rebuild and no `as TerritoryKey` cast.
            value: group,
        })),
    ];

    const handleGroupNameChange = (depIndex: number, newGroupName: string) => {
        const updatedDeps = [...data.departments];

        const normalizedValue = newGroupName.trim() === '' ? null : newGroupName;

        updatedDeps[depIndex] = {
            ...updatedDeps[depIndex],
            // spread the old group so `territory` survives a name edit
            group: { ...updatedDeps[depIndex].group, name: normalizedValue as any },
        };

        setData('departments', updatedDeps);

        // the server error now lives under the nested key
        clearErrors(`departments.${depIndex}.group.name` as any);
    };

    const handleTerritoryChange = (depIndex: number, territory: TerritoryKey) => {
        const updatedDeps = [...data.departments];

        updatedDeps[depIndex] = {
            ...updatedDeps[depIndex],
            // same idea in reverse: keep the name, replace only the territory
            group: { ...updatedDeps[depIndex].group, territory },
        };

        setData('departments', updatedDeps);
    };

    const departmentNameWidth = useMemo(() => {
        const longestName = Math.max(
            ...data.departments.map(dep =>
                (dep.group.name ?? '').length
            )
        );

        return Math.max(longestName + 3, 12);
    }, [data.departments]);

    return {
        data,
        searchQuery,
        setSearchQuery,
        selectedOption,
        setSelectedOption,
        fileInputRef,
        showSuccess,
        setShowSuccess,
        processing,
        errors,
        hasChanges,
        bossChanged,
        isMiniBossChanged,
        dropdownOptions,
        handleBossChange,
        handleDownload,
        handleFieldChangeByIndices,
        handleSave,
        handleCancel,
        handleFileChange,
        pausePopupTimer,
        resumePopupTimer,
        handleGroupNameChange,
        handleTerritoryChange,
        handleTerritoryUpload,
        globalTerritoryValue,
        onChangeGlobalTerritoryValue,
        departmentNameWidth,
    };
}