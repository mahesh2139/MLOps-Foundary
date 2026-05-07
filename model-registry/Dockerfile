FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY mlflow_config.yaml .

ENV MLFLOW_TRACKING_URI=""
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["python", "app.py"]
