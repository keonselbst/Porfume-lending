# ТИШЬ — лендинг парфюмерного дома

Структура:

```
/frontend   — React (Create React App + craco), статическая сборка
/api        — FastAPI-бэкенд, деплоится как одна serverless-функция
vercel.json — маршрутизация: /api/* -> функция, всё остальное -> SPA
```

## Деплой на Vercel

1. Залей репозиторий на GitHub и импортируй его на vercel.com/new.
   Vercel сам подхватит настройки из `vercel.json` (installCommand,
   buildCommand, outputDirectory, rewrites) — вручную ничего выбирать
   не нужно, Framework Preset можно оставить "Other".

2. Нужна база MongoDB — Vercel её не предоставляет. Быстрее всего поднять
   бесплатный кластер на MongoDB Atlas (atlas.mongodb.com) и взять оттуда
   connection string.

3. В настройках проекта на Vercel (Settings → Environment Variables)
   задай:
   - `MONGO_URL` — строка подключения к MongoDB
   - `DB_NAME` — название базы (по умолчанию `tish`, можно не задавать)
   - `SHOP_URL` — ссылка на магазин, если есть (необязательно)
   - `CORS_ORIGINS` — только если API будет дёргаться с другого домена
     (необязательно; по умолчанию фронт и API живут на одном домене)

4. Жми Deploy. При первом запуске бэкенд сам создаст индексы в MongoDB
   и загрузит коллекцию ароматов (см. `api/collection.py`).

## Локальная разработка

Фронт:
```
cd frontend
cp .env.example .env   # если бэкенд крутится отдельно от фронта
yarn install
yarn start
```

Бэкенд:
```
cd api
cp .env.example .env   # заполни MONGO_URL
pip install -r ../requirements.txt
uvicorn index:app --reload --port 8000
```
