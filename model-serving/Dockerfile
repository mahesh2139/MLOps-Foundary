FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY inference_server.py .

ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=/models
ENV MLFLOW_TRACKING_URI=""

EXPOSE 8000

CMD ["python", "-m", "gunicorn", "inference_server:app", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "60"]
