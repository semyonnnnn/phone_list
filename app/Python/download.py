from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_ORIENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import io
######################
from enums.enums import Territory

router = APIRouter()


def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()

    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)

    tcPr.append(shd)


def set_table_borders(table, size=4, color="000000"):
    tblPr = table._tbl.tblPr

    borders = OxmlElement('w:tblBorders')

    for edge in (
        'top',
        'left',
        'bottom',
        'right',
        'insideH',
        'insideV'
    ):
        edge_el = OxmlElement(f'w:{edge}')
        edge_el.set(qn('w:val'), 'single')
        edge_el.set(qn('w:sz'), str(size))
        edge_el.set(qn('w:space'), '0')
        edge_el.set(qn('w:color'), color)

        borders.append(edge_el)

    tblPr.append(borders)


BOSS_BG = "D9D9D9"
MINIBOSS_BG = "F2F2F2"
REGULAR_BG = None
POSITION_BG = "E8EEF5"


def sort_key(emp):
    if emp.get("isBoss"):
        return 0

    if emp.get("isMiniBoss"):
        return 1

    return 2


def department_sort_key(item):
    group_name = str(item[0]).strip().casefold()

    if group_name == "руководство":
        return (0, "")

    return (1, group_name)


@router.post("/files/download")
async def generate_word_document(request: Request):
    try:
        body = await request.json()
        phones = body.get("phones", [])

        # Group employees by territory -> department
        territories: dict[str, dict[str, list]] = {}

        for p in phones:
            raw_terr = (p.get("territory") or "").strip().lower()
            group_name = p.get("group") or "Отдел"

            territories.setdefault(raw_terr, {}).setdefault(group_name, []).append(p)

        # Create Word document
        doc = Document()

        # Page setup
        section = doc.sections[0]
        section.orientation = WD_ORIENT.LANDSCAPE
        section.page_width = Inches(11.0)
        section.page_height = Inches(8.5)
        section.left_margin = Inches(0.6)
        section.right_margin = Inches(0.6)

        # Column widths (total = 9.0 inches)
        col_widths = [
            Inches(3.5),  # ФИО
            Inches(1.4),  # Телефон       -> left two columns = 4.9 in (50%)
            Inches(1.2),  # Добавочный
            Inches(1.1),  # Кабинет
            Inches(2.6),  # IP            -> right three columns = 4.9 in (50%)
        ]
        half_width = Inches(4.9)
        total_width = sum(w for w in col_widths)

        def territory_sort_key(item: tuple[str, dict]):
            terr_key = item[0]
            terr_enum = Territory.from_key(terr_key)
            if terr_enum:
                return (terr_enum.sort_order, terr_key)
            return (1, terr_key)

        sorted_territories = sorted(territories.items(), key=territory_sort_key)

        # ---------------------------------------------------------
        # Territories (ekb -> ЕКБ first, krg -> КРГ last)
        # ---------------------------------------------------------
        for terr_idx, (terr_key, departments) in enumerate(sorted_territories):
            terr_enum = Territory.from_key(terr_key)
            terr_label = terr_enum.value if terr_enum else (terr_key.upper() or "Прочее")

            terr_p = doc.add_paragraph()
            terr_p.paragraph_format.space_before = Pt(6 if terr_idx == 0 else 14)
            terr_p.paragraph_format.space_after = Pt(6)
            terr_run = terr_p.add_run(terr_label)
            terr_run.bold = True
            terr_run.font.name = "Arial"
            terr_run.font.size = Pt(14)
            terr_run.font.color.rgb = RGBColor(34, 67, 118)

            # -----------------------------------------------------
            # Departments within this territory
            # -----------------------------------------------------
            for group_name, emp_list in sorted(
                departments.items(),
                key=department_sort_key
            ):
                table = doc.add_table(rows=0, cols=5)
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                table.autofit = False
                set_table_borders(table)

                # Department header
                header_row = table.add_row()
                cell_dep = header_row.cells[0]
                for i in range(1, 5):
                    cell_dep.merge(header_row.cells[i])

                set_cell_background(cell_dep, "224376")

                p = cell_dep.paragraphs[0]
                p.paragraph_format.space_before = Pt(6)
                p.paragraph_format.space_after = Pt(6)

                run = p.add_run(group_name)
                run.bold = True
                run.font.name = "Arial"
                run.font.size = Pt(11)
                run.font.color.rgb = RGBColor(255, 255, 255)

                # Column titles
                titles_row = table.add_row()
                titles = ["ФИО", "Телефон", "Добавочный", "Кабинет", "IP"]

                for idx, title_text in enumerate(titles):
                    cell = titles_row.cells[idx]
                    cell.width = col_widths[idx]
                    set_cell_background(cell, "2B579A")

                    p = cell.paragraphs[0]
                    p.paragraph_format.space_before = Pt(4)
                    p.paragraph_format.space_after = Pt(4)

                    run = p.add_run(title_text)
                    run.bold = True
                    run.font.name = "Arial"
                    run.font.size = Pt(10)
                    run.font.color.rgb = RGBColor(255, 255, 255)

                # Employees (Boss -> MiniBoss -> Regular)
                sorted_emp_list = sorted(emp_list, key=sort_key)

                for emp in sorted_emp_list:
                    row = table.add_row()
                    row_data = [
                        emp.get("person") or "",
                        emp.get("phone") or "",
                        emp.get("extension") or "",
                        emp.get("cabinet") or "",
                        emp.get("ip") or ""
                    ]

                    if emp.get("isBoss"):
                        row_bg = BOSS_BG
                    elif emp.get("isMiniBoss"):
                        row_bg = MINIBOSS_BG
                    else:
                        row_bg = REGULAR_BG

                    for idx, val in enumerate(row_data):
                        cell = row.cells[idx]
                        cell.width = col_widths[idx]

                        if row_bg:
                            set_cell_background(cell, row_bg)

                        p = cell.paragraphs[0]
                        p.paragraph_format.space_before = Pt(3)
                        p.paragraph_format.space_after = Pt(3)

                        run = p.add_run(str(val))
                        run.font.name = "Arial"
                        run.font.size = Pt(10)

                        if emp.get("isBoss"):
                            run.bold = True

                    # Optional sub-row for Position (left 50%) & Comment (right 50%)
                    position = str(emp.get("position") or "").strip()
                    comment = str(emp.get("comment") or "").strip()

                    if position or comment:
                        sub_row = table.add_row()

                        # Merge cells [0..1] for left 50% (Position) and [2..4] for right 50% (Comment)
                        left_cell = sub_row.cells[0]
                        left_cell.merge(sub_row.cells[1])
                        left_cell.width = half_width

                        right_cell = sub_row.cells[2]
                        right_cell.merge(sub_row.cells[4])
                        right_cell.width = half_width

                        for meta_cell, text_val, is_italic, cell_bg in (
                            (left_cell, position, False, POSITION_BG),
                            (right_cell, comment, True, row_bg),
                        ):
                            if cell_bg:
                                set_cell_background(meta_cell, cell_bg)

                            mp = meta_cell.paragraphs[0]
                            mp.paragraph_format.space_before = Pt(2)
                            mp.paragraph_format.space_after = Pt(2)

                            mrun = mp.add_run(text_val)
                            mrun.font.name = "Arial"
                            mrun.font.size = Pt(9)
                            mrun.italic = is_italic
                            mrun.font.color.rgb = RGBColor(68, 68, 68)

        # Save document to memory
        file_stream = io.BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)

        def iterfile():
            chunk_size = 1024 * 64
            while chunk := file_stream.read(chunk_size):
                yield chunk

        return StreamingResponse(
            iterfile(),
            media_type=(
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
            headers={
                "Content-Disposition": "attachment; filename=phone_directory.docx"
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Word generation error: {str(e)}"
        )
