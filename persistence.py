from datetime import datetime

import mysql.connector

try:
    connection = mysql.connector.connect(
        host="localhost",
        port=3306,
        user="root",  # Replace with your database user
        password="admin",  # Replace with your database password
        database="projectdb",
        use_pure=True
    )
except Exception as e:
    print(e)

cursor = connection.cursor(dictionary=True)


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
    query = (f'SELECT SKU, ProductName, Quantity, ItemLocation, LastUpdatedDate, ExpiryDate, Notes '
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
    highest_product_id = result['HighestProductID'] if result else None

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

    # Execute the query
    cursor.execute(query, data)

    # Commit the transaction
    connection.commit()


def get_last_order_id():
    query = "SELECT MAX(OrderID) AS HighestOrderID FROM `order`"
    cursor.execute(query)

    result = cursor.fetchone()
    highest_order_id = result['HighestOrderID'] if result else None

    return highest_order_id


def get_last_transport_id():
    query = "SELECT MAX(TransportID) AS HighestTransportID FROM `transport`"
    cursor.execute(query)

    result = cursor.fetchone()
    highest_transport_id = result['HighestTransportID'] if result else None

    return highest_transport_id


def get_supplier_id(supplier_name):
    query = "SELECT SupplierID FROM suppliers WHERE SupplierName = %s"
    cursor.execute(query, (supplier_name,))
    result = cursor.fetchone()
    if result:
        return result['SupplierID']
    else:
        # Handle case where LocationName is not found
        raise ValueError("Supplier not found")


def get_product_id(product_name):
    query = "SELECT ProductID FROM product WHERE ProductName = %s"
    cursor.execute(query, (product_name,))
    result = cursor.fetchone()
    if result:
        return result['ProductID']
    else:
        # Handle case where LocationName is not found
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
             f'FROM projectdb.order as o '
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


def get_transports():
    query = (f'SELECT t.TransportID, t.TransportName, t.Type, t.Status, l.LocationName, t.CreateTime '
             f'FROM transport as t INNER JOIN locations as l  ON l.LocationID = t.fk_transport_LocationId')
    cursor.execute(query)

    results = cursor.fetchall()

    transports = [
        {
            key: (value if not isinstance(value, datetime) else value.strftime('%Y-%m-%d'))
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
