# ============================================================
# Mundial2026Quiniela — Backend Dockerfile
# Multi-stage build for FastAPI + Uvicorn
# ============================================================

# ---------- Stage 1: Dependencies ----------
FROM python:3.12-slim AS deps

WORKDIR /build

# Install system deps needed for psycopg2 / asyncpg compilation
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---------- Stage 2: Runtime ----------
FROM python:3.12-slim AS runtime

# Install curl for healthcheck + libpq for asyncpg runtime
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl libpq5 && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r mundial && useradd -r -g mundial -d /app -s /sbin/nologin mundial

WORKDIR /app

# Copy installed Python packages from deps stage
COPY --from=deps /install /usr/local

# Copy application code
COPY . .

# Own everything by the non-root user
RUN chown -R mundial:mundial /app

USER mundial

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
