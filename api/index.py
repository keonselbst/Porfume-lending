import os
import re
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, field_validator
from starlette.middleware.cors import CORSMiddleware

from collection import COLLECTION

# Локально .env лежит рядом с этим файлом. На Vercel переменные окружения
# задаются в настройках проекта (Settings -> Environment Variables) и .env
# не нужен.
load_dotenv(Path(__file__).parent / '.env')

MONGO_URL = os.environ.get('MONGO_URL')
if not MONGO_URL:
    raise RuntimeError(
        'Не задана переменная окружения MONGO_URL. Нужна строка подключения '
        'к MongoDB (например, кластер MongoDB Atlas) — Vercel базу не хранит.'
    )
DB_NAME = os.environ.get('DB_NAME', 'tish')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


@asynccontextmanager
async def lifespan(app):
    await db.fragrances.create_index('id', unique=True)
    await db.leads.create_index([('contact', 1), ('created_at', -1)])
    for fragrance in COLLECTION:
        await db.fragrances.update_one({'id': fragrance['id']}, {'$set': fragrance}, upsert=True)
    yield
    client.close()


app = FastAPI(title='ТИШЬ — парфюмерный дом', lifespan=lifespan)
api = APIRouter(prefix='/api')


class Fragrance(BaseModel):
    id: str
    number: str
    name: str
    subtitle: str
    description: str
    family: str
    notes: list[str]
    pyramid: dict[str, str]
    price: int
    volume: int
    image: str
    mood: str


class CollectionResponse(BaseModel):
    products: list[Fragrance]
    shop_url: str | None


class LeadCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    contact: str = Field(min_length=5, max_length=160)
    preference: str = Field(default='', max_length=1000)
    product_id: str | None = None
    intent: Literal['selection', 'availability'] = 'selection'
    consent: bool

    @field_validator('name', 'contact', 'preference')
    @classmethod
    def clean_text(cls, value):
        return value.strip()

    @field_validator('name')
    @classmethod
    def valid_name(cls, value):
        if len(value) < 2 or not any(char.isalpha() for char in value):
            raise ValueError('Укажите ваше имя — не менее двух символов.')
        return value

    @field_validator('contact')
    @classmethod
    def valid_contact(cls, value):
        if '@' in value:
            if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]{2,}', value):
                raise ValueError('Проверьте адрес электронной почты.')
            return value.lower()
        if not re.fullmatch(r'\+?[\d\s()\-]+', value) or not 10 <= len(re.sub(r'\D', '', value)) <= 15:
            raise ValueError('Укажите корректный телефон или email.')
        return re.sub(r'[\s()\-]', '', value)

    @field_validator('consent')
    @classmethod
    def require_consent(cls, value):
        if not value:
            raise ValueError('Для отправки необходимо согласие на обработку данных.')
        return value


class LeadResponse(BaseModel):
    id: str
    message: str


@api.get('/')
async def health():
    return {'brand': 'ТИШЬ', 'status': 'ok'}


@api.get('/collection', response_model=CollectionResponse)
async def collection():
    products = await db.fragrances.find({}, {'_id': 0}).sort('number', 1).to_list(20)
    shop_url = os.environ.get('SHOP_URL')
    if shop_url and not shop_url.startswith('https://'):
        shop_url = None
    return CollectionResponse(products=products, shop_url=shop_url)


@api.get('/fragrances/{product_id}', response_model=Fragrance)
async def fragrance_detail(product_id: str):
    item = await db.fragrances.find_one({'id': product_id}, {'_id': 0})
    if not item:
        raise HTTPException(404, 'Аромат не найден.')
    return Fragrance(**item)


@api.post('/leads', status_code=201, response_model=LeadResponse)
async def create_lead(payload: LeadCreate):
    if payload.product_id and not await db.fragrances.find_one({'id': payload.product_id}, {'_id': 0, 'id': 1}):
        raise HTTPException(404, 'Аромат не найден.')
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat()
    if await db.leads.count_documents({'contact': payload.contact, 'created_at': {'$gte': cutoff}}) >= 4:
        raise HTTPException(429, 'Вы уже отправили несколько заявок. Попробуйте через 10 минут.')
    lead_id = str(uuid.uuid4())
    document = {**payload.model_dump(), 'id': lead_id, 'created_at': datetime.now(timezone.utc).isoformat(), 'status': 'new'}
    await db.leads.insert_one(document)
    return LeadResponse(id=lead_id, message='Ваша заявка сохранена. Спасибо за знакомство с ТИШЬ.')


app.include_router(api)
# На Vercel фронт и API обычно живут на одном домене (см. rewrites в
# vercel.json), поэтому CORS можно не настраивать вовсе. CORS_ORIGINS нужен,
# только если бэкенд дергают с другого домена — тогда перечислите его через
# запятую в переменной окружения.
cors_origins = os.environ.get('CORS_ORIGINS', '')
if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins.split(','),
        allow_credentials=False,
        allow_methods=['GET', 'POST'],
        allow_headers=['Content-Type'],
    )