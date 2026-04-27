FROM python:3.11-slim

# 1. Define the arguments (must match the names in docker-compose.yml)
ARG http_proxy
ARG https_proxy

# 2. Make them available as environment variables during the build phase
ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy

WORKDIR /app

COPY utils/requirements.txt ./utils/

# Now pip will automatically see the ENV variables and use the proxy
RUN pip install --no-cache-dir -r utils/requirements.txt

COPY . .

ENV PYTHONPATH=/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80", "--reload"]