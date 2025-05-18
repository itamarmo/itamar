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
    SKU: str
    Quantity: int
    Location: str
    LastUpdatedDate: date
    ExpiryDate: Optional[date] = None
    Notes: Optional[str] = None


class Order(BaseModel):
    ProductName: str
    SKU: str
    Quantity: int
    LocationName: str
    SupplierName: str


class Transport(BaseModel):
    TransportName: str
    Type: str
    Status: str
    LocationName: str


class DeleteTransport(BaseModel):
    TransportID: int

class DeleteInventory(BaseModel):
    ProductID: int


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
    product_id = product.SKU
    quantity = product.Quantity
    location = product.Location
    last_updated_date = product.LastUpdatedDate
    expiry_date = product.ExpiryDate
    notes = product.Notes

    persistence.add_inventory(product_name, product_id, quantity, location, last_updated_date, expiry_date, notes)


@app.get("/GetOrders/")
async def get_orders():
    return persistence.get_orders()

@app.get("/GetOrdersByDate/")
async def get_orders(startDate, endDate):
    return persistence.get_orders_by_date(startDate, endDate)

@app.post("/AddOrder")
async def add_order(order: Order):
    # Get all parameters from the request body
    product_name = order.ProductName
    product_id = order.SKU
    quantity = order.Quantity
    location = order.LocationName
    supplier = order.SupplierName

    persistence.add_order(product_id, product_name, quantity, supplier, location)


@app.get("/GetTransports/")
async def get_transports():
    return persistence.get_transports()


@app.post("/AddTransport")
async def add_transport(transport: Transport):
    persistence.add_transport(transport.TransportName, transport.Type, transport.LocationName, transport.Status)


@app.post("/DeleteTransport")
async def delete_transport(transport: DeleteTransport):
    persistence.delete_transport(transport.TransportID)

@app.get("/GetTransportByDate/")
async def get_transport_by_date(startDate, endDate):
    return persistence.get_transports_by_date(startDate, endDate)

@app.get("/GetInventoryMovements/")
async def get_inventory_movements():
    return persistence.get_inventory_movements()

@app.post("/DeleteInventory")
async def delete_inventory(product: DeleteInventory):
    persistence.delete_inventory(product.ProductID)