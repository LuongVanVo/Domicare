# syntax=docker/dockerfile:1

# Stage 1: Build dependency wheels
FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Use BuildKit cache mounts for apt packages
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev

COPY requirements/ ./requirements/

# Use BuildKit cache mounts for pip download and build cache
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m pip install --upgrade pip \
    && pip wheel --no-cache-dir --wheel-dir /wheels -r requirements/production.txt

# Stage 2: Final runner stage
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.production

WORKDIR /app

# Use BuildKit cache mounts for apt in final stage
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update \
    && apt-get install -y --no-install-recommends \
    libpq5

COPY --from=builder /wheels /wheels
RUN python -m pip install --no-cache-dir /wheels/* \
    && rm -rf /wheels

COPY . .

RUN addgroup --system app \
    && adduser --system --ingroup app app \
    && mkdir -p logs \
    && chown -R app:app /app

USER app

EXPOSE 8888

# Run daphne to handle both HTTP and WebSocket traffic in production
CMD ["daphne", "-b", "0.0.0.0", "-p", "8888", "config.asgi:application"]
