from datetime import datetime

import mysql.connector

try:
    connection = mysql.connector.connect(
        host="localhost",
        port=3306,
        user="root",  # Replace with your database user
        password="123456",  # Replace with your database password
        database="projectdb",
        use_pure=True
    )
except Exception as e:
    print(e)

cursor = connection.cursor(buffered=True, dictionary=True)
#cursor = connection.cursor(dictionary=True)


def look_for_user(username, password):
    query = f'SELECT * FROM users WHERE userName = %s AND password = %s'
    cursor.execute(query, (username, password))

    # Fetch one result
    user = cursor.fetchone()

    if user:
        print(f'User {username} verified')
        return True

    return False


def get_inventory():
    query = (f'SELECT ProductID, SKU, ProductName, Quantity, ItemLocation, LastUpdatedDate, ExpiryDate, Notes '
             f'FROM product')
    cursor.execute(query)

    results = cursor.fetchall()

    inventory = [
        {
            key: (value if not isinstance(value, datetime) else value.strftime('%Y-%m-%d'))
            for key, value in row.items()
        }
        for row in results
    ]
    return inventory


def get_location_id(location_name):
    query = "SELECT LocationID FROM Locations WHERE LocationName = %s"
    cursor.execute(query, (location_name,))
    result = cursor.fetchone()
    if result:
        return result['LocationID']
    else:
        # Handle case where LocationName is not found
        raise ValueError("Location not found")


def get_last_product_id():
    query = "SELECT MAX(ProductID) AS HighestProductID FROM product"
    cursor.execute(query)

    result = cursor.fetchone()
    highest_product_id = result['HighestProductID'] if result else 0

    return highest_product_id


def add_inventory(product_name, sku, quantity, location, last_updated_date, expiry_date, notes):
    query = """
        INSERT INTO product (ProductId, ProductName, SKU, Quantity, ItemLocation, LastUpdatedDate, ExpiryDate, Notes, FK_LocationID)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    # Convert dates if necessary (assuming they are datetime objects or strings in 'YYYY-MM-DD' format)
    if isinstance(last_updated_date, datetime):
        last_updated_date = last_updated_date.strftime('%Y-%m-%d')

    if isinstance(expiry_date, datetime):
        expiry_date = expiry_date.strftime('%Y-%m-%d')

    location_id = get_location_id(location)

    data = (get_last_product_id() + 1, product_name, sku, quantity, location, last_updated_date, expiry_date, notes,
            location_id)

    cursor.execute(query, data)

    connection.commit()


def edit_inventory(product_name, sku, quantity, location, last_updated_date, expiry_date, notes):
    query = """
UPDATE product
SET
  ProductName = %s,
  Quantity = %s,
  ItemLocation = %s,
  LastUpdatedDate = %s,
  ExpiryDate = %s,
  Notes = %s,
  FK_LocationID = %s
WHERE
  SKU = %s;
    """

    # Convert dates if necessary (assuming they are datetime objects or strings in 'YYYY-MM-DD' format)
    if isinstance(last_updated_date, datetime):
        last_updated_date = last_updated_date.strftime('%Y-%m-%d')

    if isinstance(expiry_date, datetime):
        expiry_date = expiry_date.strftime('%Y-%m-%d')

    location_id = get_location_id(location)

    data = (product_name, quantity, location, last_updated_date, expiry_date, notes,
            location_id, sku)

    cursor.execute(query, data)
    rows_affected = cursor.rowcount
    print(f"Rows affected: {rows_affected}")
    connection.commit()

def get_last_order_id():
    query = "SELECT MAX(OrderID) AS HighestOrderID FROM `order`"
    cursor.execute(query)

    result = cursor.fetchone()
    highest_order_id = result['HighestOrderID'] if result and result['HighestOrderID'] is not None else 0

    return highest_order_id


def get_last_transport_id():
    query = "SELECT MAX(TransportID) AS HighestTransportID FROM `transport`"
    cursor.execute(query)

    result = cursor.fetchone()
    highest_transport_id = result['HighestTransportID'] if result and result['HighestTransportID'] is not None else 0

    return highest_transport_id


def get_supplier_id(supplier_name):
    query = "SELECT SupplierID FROM suppliers WHERE SupplierName = %s"
    cursor.execute(query, (supplier_name,))
    result = cursor.fetchone()
    if result:
        return result['SupplierID']
    else:
        raise ValueError("Supplier not found")


def get_product_id(product_name):
    query = "SELECT ProductID FROM product WHERE ProductName = %s"
    cursor.execute(query, (product_name,))
    result = cursor.fetchone()
    if result:
        return result['ProductID']
    else:
        raise ValueError("Product not found")


def add_order(sku, product_name, quantity, supplier_name, location_name):
    order_id = get_last_order_id() + 1
    location_id = get_location_id(location_name)
    supplier_id = get_supplier_id(supplier_name)
    product_id = get_product_id(product_name)

    query = """
        INSERT INTO `order` (OrderID, ItemName, SKU, ProductID, Quantity, RequiredDate, SupplierID, LocationID, UserID)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    required_date = datetime.now().strftime('%Y-%m-%d')

    data = (order_id, product_name, sku, product_id, quantity, required_date, supplier_id, location_id, 1)

    cursor.execute(query, data)

    connection.commit()


def get_orders():
    query = (f'SELECT p.SKU, p.ProductName, o.Quantity, s.SupplierName, p.Notes, l.LocationName '
             f'FROM projectdb.`order` as o '
             f'INNER JOIN suppliers as s ON o.SupplierID = s.SupplierID '
             f'INNER JOIN product as p ON o.ProductID = p.ProductID '
             f'INNER JOIN locations as l ON o.LocationID = l.LocationID')

    cursor.execute(query)

    results = cursor.fetchall()

    orders = [
        {
            key: (value if not isinstance(value, datetime) else value.strftime('%Y-%m-%d'))
            for key, value in row.items()
        }
        for row in results
    ]
    return orders


def get_orders_by_date(start_date, end_date):
    query = (f'SELECT p.SKU, p.ProductName, o.Quantity, s.SupplierName, p.Notes, l.LocationName '
             f'FROM projectdb.`order` as o '
             f'INNER JOIN suppliers as s ON o.SupplierID = s.SupplierID '
             f'INNER JOIN product as p ON o.ProductID = p.ProductID '
             f'INNER JOIN locations as l ON o.LocationID = l.LocationID '
             f'WHERE o.RequiredDate >= %s AND o.RequiredDate <= %s')

    cursor.execute(query, (start_date, end_date))

    results = cursor.fetchall()

    orders = [
        {
            key: (value if not isinstance(value, datetime) else value.strftime('%Y-%m-%d'))
            for key, value in row.items()
        }
        for row in results
    ]
    return orders


def get_transports():
    query = (f'SELECT t.TransportID, t.TransportName, t.Type, t.Status, l.LocationName, t.CreateTime '
             f'FROM transport as t INNER JOIN locations as l  ON l.LocationID = t.fk_transport_LocationId')
    cursor.execute(query)

    results = cursor.fetchall()

    transports = [
        {
            key: (value if not isinstance(value, datetime) else value.strftime('%Y-%m-%d %H:%M:%S'))
            for key, value in row.items()
        }
        for row in results
    ]
    return transports


def add_transport(transport_name, transport_type, location_name, status):
    transport_id = get_last_transport_id() + 1
    location_id = get_location_id(location_name)

    query = """
        INSERT INTO `transport` (TransportID, TransportName, Type, Status, fk_transport_LocationId, CreateTime)
        VALUES (%s, %s, %s, %s, %s, %s)
    """

    data = (transport_id, transport_name, transport_type, status, location_id, datetime.now())

    cursor.execute(query, data)

    connection.commit()


def delete_transport(transport_id):
    query = """
        DELETE FROM `transport` WHERE TransportID = %s
    """

    data = [transport_id]

    cursor.execute(query, data)

    connection.commit()
    
    
def delete_inventory(inventory_id):
    query = """
        DELETE FROM `product` WHERE ProductID = %s
    """

    data = [inventory_id]

    cursor.execute(query, data)

    connection.commit()


def get_transports_by_date(start_date, end_date):
    query = (f'SELECT t.TransportID, t.TransportName, t.Type, t.Status, l.LocationName, t.CreateTime '
             f'FROM transport as t INNER JOIN locations as l ON l.LocationID = t.fk_transport_LocationId '
             f'WHERE t.CreateTime >= %s AND t.CreateTime <= %s')
    cursor.execute(query, (start_date, end_date))

    results = cursor.fetchall()

    transports = [
        {
            key: (value if not isinstance(value, datetime) else value.strftime('%Y-%m-%d %H:%M:%S'))
            for key, value in row.items()
        }
        for row in results
    ]
    return transports


def get_inventory_movements():
    query = ('''
    SELECT 
        po.OrderID,
        po.ItemName,
        po.SKU,
        po.Quantity,
        po.RequiredDate,
        s.SupplierName AS Supplier,
        u.UserName AS RequestedBy,
        CASE 
            WHEN po.ProductID IS NOT NULL AND po.SupplierID IS NULL THEN 'Outgoing'
            WHEN po.SupplierID IS NOT NULL THEN 'Incoming'
            ELSE 'Unknown'
        END AS InventoryMovementType,
        p.ProductName AS RelatedProduct
    FROM 
        projectdb.`order` po
    LEFT JOIN 
        suppliers s ON po.SupplierID = s.SupplierID
    LEFT JOIN 
        users u ON po.UserID = u.UserID
    LEFT JOIN 
        product p ON po.ProductID = p.ProductID
    ORDER BY 
        po.RequiredDate DESC;
    ''')

    cursor.execute(query)

    results = cursor.fetchall()

    inventory_movements = [
        {
            key: (value.strftime('%Y-%m-%d') if isinstance(value, datetime) else value)
            for key, value in row.items()
        }
        for row in results
    ]
    return inventory_movements
