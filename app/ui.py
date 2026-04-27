from fastapi.templating import Jinja2Templates

# This is the single source of truth for your UI
templates = Jinja2Templates(directory="templates")