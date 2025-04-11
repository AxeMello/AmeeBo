const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.listen(5000, '0.0.0.0', () => {
    console.log('Server is running on port 5000');
});

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '34019318',
    database: 'BillOrderDB',
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
});


// DIRECTOR ORDERS

// Route to save a new order
app.post('/api/orders', (req, res) => {
    const { panelNumber, orderDate, rows } = req.body;

    // Insert into Orders table
    const insertOrderSQL = `INSERT INTO Orders (panelNumber, orderDate) VALUES (?, ?)`;
    db.query(insertOrderSQL, [panelNumber, orderDate], (err, orderResult) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving the order.');
        }

        // Prepare and insert rows into OrderDetails table
        const insertOrderDetailsSQL = `INSERT INTO OrderDetails (panelNumber, description, current, quantity, orderDescription, remarks, accessories) VALUES ?`;
        const values = rows.map(row => [
            panelNumber,              // Foreign key
            row.description,          // Description of the item
            row.current,              // Current value
            row.quantity,             // Quantity
            row.orderDescription,     // Additional description
            row.remarks,              // Remarks
            row.accessories           // Accessories
        ]);

        db.query(insertOrderDetailsSQL, [values], (err, detailsResult) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving the order details.');
            }
            res.status(200).send('Order saved successfully.');
        });
    });
});

// Route to fetch all orders 
app.get('/api/orders', (req, res) => {
    const sql = `SELECT * FROM Orders`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching the orders.');
        }
        res.status(200).json(results);
    });
});

// Route to fetch order details by panelNumber
app.get('/api/orders/details/:panelNumber', (req, res) => {
    const { panelNumber } = req.params;
    const sql = `SELECT * FROM OrderDetails WHERE panelNumber = ?`;
    db.query(sql, [panelNumber], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching the order details.');
        }
        res.status(200).json(results);
    });
});

// Route to delete an order
app.delete('/api/orders/:panelNumber', (req, res) => {
    const { panelNumber } = req.params;

    // Delete related rows in OrderDetails first
    const deleteOrderDetailsSQL = `DELETE FROM OrderDetails WHERE panelNumber = ?`;
    db.query(deleteOrderDetailsSQL, [panelNumber], (err, detailsResult) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error deleting the order details.');
        }

        // Then delete from Orders table
        const deleteOrderSQL = `DELETE FROM Orders WHERE panelNumber = ?`;
        db.query(deleteOrderSQL, [panelNumber], (err, orderResult) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error deleting the order.');
            }
            res.status(200).send('Order deleted successfully.');
        });
    });
});

// DELETE: First, delete the existing order details and then the order itself
app.delete('/api/orders/:panelNumber', (req, res) => {
    const { panelNumber } = req.params;

    // Step 1: Delete related rows in OrderDetails first
    const deleteOrderDetailsSQL = `DELETE FROM OrderDetails WHERE panelNumber = ?`;
    db.query(deleteOrderDetailsSQL, [panelNumber], (err, detailsResult) => {
        if (err) {
            console.error('Error deleting order details:', err);
            return res.status(500).send('Error deleting the order details.');
        }

        // Step 2: Then delete from Orders table
        const deleteOrderSQL = `DELETE FROM Orders WHERE panelNumber = ?`;
        db.query(deleteOrderSQL, [panelNumber], (err, orderResult) => {
            if (err) {
                console.error('Error deleting order:', err);
                return res.status(500).send('Error deleting the order.');
            }
            res.status(200).send('Order deleted successfully.');
        });
    });
});

// POST: Save new order and details
app.post('/api/orders', (req, res) => {
    const { panelNumber, orderDate, rows } = req.body;

    // Step 1: Insert into Orders table
    const insertOrderSQL = `INSERT INTO Orders (panelNumber, orderDate) VALUES (?, ?)`;
    db.query(insertOrderSQL, [panelNumber, orderDate], (err, orderResult) => {
        if (err) {
            console.error('Error saving the order:', err);
            return res.status(500).send('Error saving the order.');
        }

        // Step 2: Prepare and insert rows into OrderDetails table
        const insertOrderDetailsSQL = `INSERT INTO OrderDetails (panelNumber, description, current, quantity, orderDescription, remarks, accessories) VALUES ?`;
        const values = rows.map(row => [
            panelNumber,              // Foreign key
            row.description,          // Description of the item
            row.current,              // Current value
            row.quantity,             // Quantity
            row.orderDescription,     // Additional description
            row.remarks,              // Remarks
            row.accessories           // Accessories
        ]);

        db.query(insertOrderDetailsSQL, [values], (err, detailsResult) => {
            if (err) {
                console.error('Error saving the order details:', err);
                return res.status(500).send('Error saving the order details.');
            }
            res.status(200).send('Order saved successfully.');
        });
    });
});

// Route to update both managerStatus, storeStatus and checkStatus in the Orders table
app.put('/api/orders/:panelNumber', (req, res) => {
    const { panelNumber } = req.params;
    const { managerStatus, storeStatus, checkStatus, managerReason, storeReason, checkReason } = req.body;

    console.log('Panel Number:', panelNumber);
    console.log('Manager Status:', managerStatus);
    console.log('Store Status:', storeStatus);
    console.log('Check Status:', checkStatus); 
    console.log('Manager Reason:', managerReason);
    console.log('Store Reason:', storeReason);
    console.log('Check Reason:', checkReason);
    
    // SQL query
    const updateOrderSQL = `UPDATE Orders SET managerStatus = ?, storeStatus = ?, checkStatus = ?, managerReason = ?, storeReason = ?, checkReason = ? WHERE panelNumber = ?`;

    // Execute the query
    db.query(updateOrderSQL, [managerStatus, storeStatus, checkStatus, managerReason, storeReason, checkReason, panelNumber], (err, result) => {
        if (err) {
            console.error('Error updating statuses:', err);
            return res.status(500).send('Error updating the statuses.');
        }

        if (result.affectedRows === 0) {
            console.error('Order not found for panelNumber:', panelNumber);
            return res.status(404).send('Order not found.');
        }

        console.log('Statuses updated successfully for panelNumber:', panelNumber);
        res.status(200).send('Statuses updated successfully.');
    });
});

//MANAGER ORDERS

// Route to save sent orders and their details
app.post('/api/sentorders', (req, res) => {
    const { panelNumber, orderDate, rows } = req.body;

    // Insert into Orders table
    const insertOrderSQL = `INSERT INTO sentOrders (panelNumber, orderDate) VALUES (?, ?)`;
    db.query(insertOrderSQL, [panelNumber, orderDate], (err, orderResult) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving the order.');
        }

        // Prepare and insert rows into OrderDetails table
        const insertOrderDetailsSQL = `INSERT INTO sentOrderDetails (panelNumber, description, current, quantity, orderDescription, remarks, accessories) VALUES ?`;
        const values = rows.map(row => [
            panelNumber,
            row.description, 
            row.current,         
            row.quantity,           
            row.orderDescription,     
            row.remarks,           
            row.accessories        
        ]);

        db.query(insertOrderDetailsSQL, [values], (err, detailsResult) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving the order details.');
            }
            res.status(200).send('Order saved successfully.');
        });
    });
});

// Route to fetch all orders 
app.get('/api/sentorders', (req, res) => {
    const sql = `SELECT * FROM sentOrders`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching the orders.');
        }
        res.status(200).json(results);
    });
});

// Route to fetch order details by panelNumber
app.get('/api/sentorders/details/:panelNumber', (req, res) => {
    const { panelNumber } = req.params;
    const sql = `SELECT * FROM sentOrderDetails WHERE panelNumber = ?`;
    db.query(sql, [panelNumber], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching the order details.');
        }
        res.status(200).json(results);
    });
});


//STORE ORDERS

// Route to save approved orders and their details
app.post('/api/approvedorders', (req, res) => {
    const { panelNumber, orderDate, rows } = req.body;

    // Insert into Orders table
    const insertOrderSQL = `INSERT INTO approvedOrders (panelNumber, orderDate) VALUES (?, ?)`;
    db.query(insertOrderSQL, [panelNumber, orderDate], (err, orderResult) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error saving the order.');
        }

        // Prepare and insert rows into OrderDetails table
        const insertOrderDetailsSQL = `INSERT INTO approvedOrderDetails (panelNumber, description, current, quantity, orderDescription, remarks, accessories) VALUES ?`;
        const values = rows.map(row => [
            panelNumber,              // Foreign key
            row.description,          // Description of the item
            row.current,              // Current value
            row.quantity,             // Quantity
            row.orderDescription,     // Additional description
            row.remarks,              // Remarks
            row.accessories           // Accessories
        ]);

        db.query(insertOrderDetailsSQL, [values], (err, detailsResult) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving the order details.');
            }
            res.status(200).send('Order saved successfully.');
        });
    });
});

// Route to fetch all orders 
app.get('/api/approvedorders', (req, res) => {
    const sql = `SELECT * FROM approvedOrders`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching the orders.');
        }
        res.status(200).json(results);
    });
});

// Route to fetch order details by panelNumber
app.get('/api/approvedorders/details/:panelNumber', (req, res) => {
    const { panelNumber } = req.params;
    const sql = `SELECT * FROM approvedOrderDetails WHERE panelNumber = ?`;
    db.query(sql, [panelNumber], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching the order details.');
        }
        res.status(200).json(results);
    });
});




// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
