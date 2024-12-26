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
    query = (f'SELECT ProductID, ProductName, Quantity, ItemLocation, LastUpdatedDate, ExpiryDate, Notes '
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

def add_inventory(product_name, product_id, quantity, location, last_updated_date, expiry_date, notes):
    query = """
                    INSERT INTO product (ProductName, ProductID, SKU, Quantity, ItemLocation, LastUpdatedDate, ExpiryDate, Notes, FK_LocationID)
                    VALUES (%s, %s, '', %s, %s, %s, %s, %s, %s)
                """

    # Convert dates if necessary (assuming they are datetime objects or strings in 'YYYY-MM-DD' format)
    if isinstance(last_updated_date, datetime):
        last_updated_date = last_updated_date.strftime('%Y-%m-%d')

    if isinstance(expiry_date, datetime):
        expiry_date = expiry_date.strftime('%Y-%m-%d')

    location_id = get_location_id(location)

    data = (product_name, product_id, quantity, location, last_updated_date, expiry_date, notes, location_id)

    # Execute the query
    cursor.execute(query, data)

    # Commit the transaction
    connection.commit()