# ТИШЬ — лендинг парфюмерного дома

Структура:

```
/frontend   — React (Create React App + craco), статическая сборка
/api        — FastAPI-бэкенд, деплоится как одна serverless-функция
vercel.json — маршрутизация: /api/* -> функция, всё остальное -> SPA
```

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
