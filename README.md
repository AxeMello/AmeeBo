Bill Order Management System

The Bill Order Management System is a web-based application designed to manage the lifecycle of bill orders. It includes features for creating, viewing, editing, approving, issuing, and checking orders. The system is role-based, with different functionalities available for Directors, Managers, Store personnel, and Checkers.

Key Components
Frontend
- Technology: HTML, CSS, JavaScript

Backend
- File: server.js
- Technology: Node.js with Express.js
- Database: MySQL
- API Endpoints: to fetch data’s

Scripts:
  - newOrder.js: Handles the creation of new orders.
  - editOrder.js: Handles editing of existing orders.
  - viewOrder.js: Displays a list of all orders.
  - managerView.js: Displays orders for Managers to approve or reject.
  - storeView.js: Displays orders for Store personnel to issue or mark as out of stock.
  - checkView.js: Displays orders for Checkers to verify.
  - viewOrderDetails.js, managerViewDetails.js, storeViewDetails.js, checkViewDetails.js: Handle detailed views for respective roles.


Roles and Credentials
Role      	Description
Director  	Create, view, edit, and delete orders.                                  
Manager   	Approve or reject orders.
Store     	Issue orders or mark them as out of stock.                              
Checker   	Verify orders and mark missing items.


Features
1. Login System
- Role-based login with predefined credentials.
- Redirects users to their respective dashboards.

2. Order Management
- Create Orders: Directors can create new orders with detailed information.
- View Orders: All roles can view orders relevant to their responsibilities.
- Edit Orders: Directors can edit existing orders.
- Delete Orders: Directors can delete orders.

3. Approval Workflow
- Managers can approve or reject orders with reasons.
- Store personnel can issue orders or mark them as out of stock.
- Checkers can verify orders and mark missing items.

4. Export and Print
- Export order details to Excel files.
- Print order details directly from the browser.


Setup Instructions
1. Prerequisites
•	Node.js installed on your system.
•	MySQL database server installed and running.

2. Installation
 .	Clone the repository.
 .	Navigate to the project directory.
 .	Install dependencies:
npm install


3.Database Setup
 .	Import the billorderdb.sql file into your MySQL server:
mysql -u [username] -p [database_name] < billorderdb.sql

 .	Update the database connection details in server.js:
const db = mysql.createConnection({
    host: 'your-database-host',
    user: 'your-database-username',
    password: 'your-database-password',
    database: 'billorderdb',
});

 . Run the Server
Start the server:
npm start
The server will run on http://localhost:5000.

 . Access the Application
Open index.html in your browser to access the login page.
