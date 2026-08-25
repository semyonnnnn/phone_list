FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System deps (for pandas, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
RUN pip install --no-cache-dir \
    pandas \
    openpyxl \
    python-docx \
    mysql-connector-python \
    fastapi \
    uvicorn \
    python-multipart \
    numpy

# Copy app
COPY . /app

EXPOSE 9000

CMD ["uvicorn", "app.Python.server:app", "--host", "0.0.0.0", "--port", "9000", "--reload"]