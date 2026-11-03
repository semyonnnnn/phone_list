import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import { PhoneRecord, PageProps, DepartmentOption } from './types';

export function usePhoneDirectory(
    initialDeps: Array<{ group: string; phones: PhoneRecord[] }>,
    filters: PageProps['filters'],
    flash: PageProps['flash'],
    allGroups?: string[]
) {
    const [originalDeps, setOriginalDeps] = useState(initialDeps);
    const [selectedOption, setSelectedOption] = useState(filters?.department || 'Все отделы');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const { data, setData, put, processing, errors, clearErrors } = useForm({
        departments: initialDeps,
    });
    const errorBag = errors as unknown as Record<string, string>;

    // Server-side validation errors from the last response. They live in the page props
    // next to `departments`, so both are visible in the same render. The double cast
    // is needed because Inertia's default PageProps type doesn't declare `errors`.
    const page = usePage();
    const pageErrors = (page.props as unknown as { errors?: Record<string, string> }).errors;

    // Copies the server's departments into the form whenever a new array arrives.
    useEffect(() => {
        if (!initialDeps) return;

        // A rejected save comes back as a redirect that re-sends `departments` from the
        // DB (a NEW array, so this effect fires) together with a non-empty `errors` prop.
        // Overwriting the form now would wipe the name you typed and make hasChanges
        // false, so the prompt would vanish. Skip the sync while errors are present;
        // the next response without errors (a good save, Cancel, a search) syncs again.
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

    // Debounced search/department filter: asks the server for a new page 350 ms
    // after the last change, and only if something differs from the current filters.
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentSearch = filters?.search || '';
            const currentDep = filters?.department || 'Все отделы';

            if (searchQuery !== currentSearch || selectedOption !== currentDep) {
                router.get(
                    route('phones.index'),
                    {
                        search: searchQuery,
                        department: selectedOption === 'Все отделы' ? '' : selectedOption
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
    }, [searchQuery, selectedOption]);

    // Both sides are plain JSON data, so comparing their serialized form is enough.
    // The old parse(stringify(x)) round trip produced exactly the same string again,
    // at the cost of extra passes over the whole page on every committed edit.
    const hasChanges = useMemo(
        () => JSON.stringify(data.departments) !== JSON.stringify(originalDeps),
        [data.departments, originalDeps]
    );

    // NOTE: unchanged on purpose. It still reads the old alias fields (is_boss, nach,
    // is_miniboss, zam, is_zam), which your data never contains, so both flags are
    // always false and the red dots never show. Fixing it changes visible behavior.
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
        { label: 'Все отделы', value: { number: '', name: '' } },
        ...(allGroups || []).map((groupName, i) => ({
            label: groupName,
            value: { number: String(i), name: groupName }
        }))
    ];

    const handleGroupNameChange = (depIndex: number, newGroupName: string) => {
        const updatedDeps = [...data.departments];

        const normalizedValue = newGroupName.trim() === '' ? null : newGroupName;

        updatedDeps[depIndex] = {
            ...updatedDeps[depIndex],
            group: normalizedValue as any,
        };

        setData('departments', updatedDeps);

        // Editing the field dismisses its own server error, like handleFieldChangeByIndices.
        clearErrors(`departments.${depIndex}.group` as any);
    };

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
    };
}