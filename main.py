from datetime import date
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

import persistence
from persistence import look_for_user

print("aaaaaaaaaaaaaa")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow only this origin
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


class Product(BaseModel):
    ProductName: str
    ProductId: int
    Quantity: int
    Location: str
    LastUpdatedDate: date
    ExpiryDate: Optional[date] = None
    Notes: Optional[str] = None


@app.get("/login/{user}/{password}/")
async def login(user: str, password: str):
    return look_for_user(user, password)


@app.get("/GetInventory/")
async def get_inventory():
    return persistence.get_inventory()


@app.post("/AddInventory")
async def add_inventory(product: Product):
    # Get all parameters from the request body
    product_name = product.ProductName
    product_id = product.ProductId
    quantity = product.Quantity
    location = product.Location
    last_updated_date = product.LastUpdatedDate
    expiry_date = product.ExpiryDate
    notes = product.Notes

    persistence.add_inventory(product_name, product_id, quantity, location, last_updated_date, expiry_date, notes)
