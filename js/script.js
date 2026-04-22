
(function () {
    const departments = [];
    let excelData = [];
    const masterMap = new Map();

    // 1. Инициализация Map: храним ссылку на объект сотрудника и его текущий отдел
    function initMasterMap() {
        if (typeof departments !== 'undefined' && Array.isArray(departments)) {
            masterMap.clear();
            departments.forEach(dept => {
                if (dept.employees) {
                    dept.employees.forEach(emp => {
                        const key = (emp.name || '').trim().replace(/\s+/g, ' ').toLowerCase();
                        if (key) {
                            // КЛЮЧЕВОЕ: Сохраняем ссылку на объект emp. Любое изменение emp.phone изменит его в departments
                            masterMap.set(key, { emp, deptEmployees: dept.employees });
                        }
                    });
                }
            });
        }
    }

    function parsePhone(phoneVal, extVal) {
        if (extVal) return { external: String(phoneVal), internal: String(extVal) };
        let str = String(phoneVal || '');
        if (str.includes('доб.')) {
            let parts = str.split('доб.');
            return { external: parts[0].trim(), internal: parts[1].trim() };
        }
        return { external: str.trim(), internal: '' };
    }

    function formatPhoneNumber(phoneVal) {
        if (!phoneVal) return '';
        let clean = String(phoneVal).replace(/\D/g, '');

        if (clean.length === 11) {
            const prefix = clean.startsWith('7') ? '+7' : (clean.startsWith('8') ? '8' : null);
            if (prefix) {
                return `${prefix} (${clean.substring(1, 4)}) ${clean.substring(4, 7)}-${clean.substring(7, 9)}-${clean.substring(9, 11)}`;
            }
        }
        if (clean.startsWith('734337') && clean.length === 10) {
            let local = clean.substring(3);
            return local.substr(0, 3) + '-' + local.substr(3, 2) + '-' + local.substr(5, 2);
        }
        return phoneVal;
    }

    function render() {
        const container = document.getElementById('directory-content');
        const searchInput = document.getElementById('search-input');
        if (!container) return;

        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (typeof departments === 'undefined') return;

        let html = `<div style="text-align:right; margin-bottom:10px; font-size:12px;">Актуально: ${new Date().toLocaleDateString('ru-RU')}</div>`;

        departments.forEach(dept => {
            let emps = [...(dept.employees || [])]; // Create a copy to avoid mutating the original array order every render

            if (query) {
                emps = emps.filter(e => (e.name || '').toLowerCase().includes(query));
            }
            if (emps.length === 0) return;

            // --- SORTING LOGIC ---
            // This moves isBoss: true to the top. 
            // If b.isBoss is true (1) and a.isBoss is false (0), the result is positive, pushing 'b' up.
            emps.sort((a, b) => (b.isBoss ? 1 : 0) - (a.isBoss ? 1 : 0));

            html += `<div class="department-header" style="background:#ecf0f1; padding:10px; font-weight:bold; border-left:4px solid #3498db; margin-top:20px;">${dept.name}</div>`;
            html += `<table border="1" style="width:100%; border-collapse:collapse; background:white;">
        <thead>
            <tr style="background:#3498db; color:white;">
                <th width="5%">№</th><th width="35%">ФИО</th><th width="10%">Каб.</th><th width="20%">Телефон</th><th width="10%">доб.</th><th width="20%">IP</th>
            </tr>
        </thead>
        <tbody>`;

            emps.forEach((emp, idx) => {
                const p = parsePhone(emp.phone, emp.ext);
                const rowStyle = query ? 'background:#fff9c4;' : '';
                html += `<tr style="${rowStyle}">
                <td align="center">${idx + 1}</td>
                <td style="${emp.isBoss ? 'font-weight:bold' : ''}">${emp.name || ''}</td>
                <td align="center">${emp.cabinet || ''}</td>
                <td style="padding-left:5px;">${formatPhoneNumber(p.external)}</td>
                <td align="center">${p.internal || ''}</td>
                <td align="center" style="font-family:monospace;">${emp.ip || ''}</td>
            </tr>`;
            });
            html += `</tbody></table>`;
        });
        container.innerHTML = html || '<p style="text-align:center;">Данные не найдены</p>';
    }

    function handleExcel(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (le) {
            const data = new Uint8Array(le.target.result);
            const wb = XLSX.read(data, { type: 'array' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            if (rows.length < 2) return;

            const headers = rows[1].map(h => String(h).trim());
            const idx = {
                name: headers.indexOf('Отображаемое имя'),
                int: headers.indexOf('Внутренний номер'),
                ext: headers.indexOf('Номер для исходящих вызовов'),
                grp: headers.indexOf('Группа')
            };

            rows.slice(2).forEach(row => {
                const rawName = row[idx.name];
                if (!rawName) return;

                const normName = rawName.trim().replace(/\s+/g, ' ').toLowerCase();
                const phoneFromFile = row[idx.ext];
                const internalFromFile = row[idx.int];
                const groupNameFromExcel = (row[idx.grp] || 'Прочие').trim();

                let targetDept = departments.find(d => d.name.trim().toLowerCase() === groupNameFromExcel.toLowerCase());
                if (!targetDept) {
                    targetDept = { name: groupNameFromExcel, employees: [] };
                    departments.push(targetDept);
                }

                if (masterMap.has(normName)) {
                    const record = masterMap.get(normName);

                    // ЛОГИКА ЗАМЕНЫ: Принудительно обновляем поля в существующем объекте
                    // Это обновит данные прямо в массиве departments, так как record.emp - это ссылка
                    record.emp.phone = phoneFromFile;
                    record.emp.ext = internalFromFile;

                    // Перенос между отделами, если группа в Excel изменилась
                    if (targetDept.employees !== record.deptEmployees) {
                        const oldIdx = record.deptEmployees.indexOf(record.emp);
                        if (oldIdx > -1) record.deptEmployees.splice(oldIdx, 1);

                        targetDept.employees.push(record.emp);
                        record.deptEmployees = targetDept.employees;
                    }
                } else {
                    // Новый сотрудник
                    const newE = {
                        name: rawName,
                        phone: phoneFromFile,
                        ext: internalFromFile,
                        cabinet: '',
                        ip: '',
                        isBoss: false
                    };
                    targetDept.employees.push(newE);
                    masterMap.set(normName, { emp: newE, deptEmployees: targetDept.employees });
                }
            });

            // После обработки всех строк вызываем render, чтобы обновить таблицу на странице
            render();
        };
        reader.readAsArrayBuffer(file);
    }

    function downloadWord() {
        let content = '';
        departments.forEach(dept => {
            if (dept.excludeFromWord || !dept.employees || dept.employees.length === 0) return;
            content += `<div style="background:#f2f2f2; font-weight:bold; padding:5px; border-bottom:1px solid #000; margin-top:10px;">${dept.name}</div>`;
            content += `<table border="1" style="width:100%; border-collapse:collapse;">
        <thead><tr style="background:#3498db; color:white;"><th>№</th><th>ФИО</th><th>Каб.</th><th>Телефон</th><th>доб.</th><th>IP</th></tr></thead>
        <tbody>`;
            dept.employees.forEach((emp, idx) => {
                const p = parsePhone(emp.phone, emp.ext);
                content += `<tr>
                <td align="center">${idx + 1}</td>
                <td>${emp.name || ''}</td>
                <td align="center">${emp.cabinet || ''}</td>
                <td>${formatPhoneNumber(p.external)}</td>
                <td align="center">${p.internal || ''}</td>
                <td align="center">${emp.ip || ''}</td>
            </tr>`;
            });
            content += `</tbody></table>`;
        });
        const fullHtml = `<html><head><meta charset="UTF-8"></head><body>${content}</body></html>`;
        const blob = new Blob([fullHtml], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Spravochnik.doc`;
        link.click();
    }

    document.addEventListener('DOMContentLoaded', () => {
        initMasterMap();
        render();
        document.getElementById('search-input')?.addEventListener('input', render);
        document.getElementById('excel-file')?.addEventListener('change', handleExcel);
        document.getElementById('downloadBtn')?.addEventListener('click', downloadWord);
    });

    if (document.readyState === "complete" || document.readyState === "interactive") {
        initMasterMap();
        render();
    }
})();
