#  [Service Center App](https://service-center-app-sc1d.onrender.com/)
 Professional request and repair management system for service centers.</b></p>

---

##  About the Project

This full-fledged web application is designed to automate business processes in a service center. The system provides convenient interaction between clients, masters, and administration, optimizing the accounting of repair work and improving the quality of service.

--- 

##  Core Features

The application is built using a strict Role-Based Access Control (RBAC) model:

- **Administrator (Admin):** - Full control over the system and dashboard.
  - Creation and management of master accounts.
  - Editing and distribution of all orders in the system.
- **Master:** - Personal cabinet for viewing assigned orders.
  - Updating stages and statuses of repair execution in real-time.
- **Client:** - Registration and secure login.
  - Creation of new service requests.
  - Tracking the current status of their devices and viewing the history of requests (archive).

---

##  Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Frontend:** Handlebars (.hbs) template engine, HTML5, CSS3
- **Security:** Password hashing, route protection via custom Auth Middleware

---

##  Installation and Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/katerynksh/service-center-app.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the project root based on the provided `.env.example` and specify your configurations (e.g., PostgreSQL database access):
   ```env
      DB_URL = <your db url>
      PORT = <3000>
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   *After starting, the application will be available at `http://localhost:3000` (or another port specified in `.env`).*

---
## Project Structure
      SERVICE-CENTER-APP/
            ├── config/
            │ └── db.js             # Setting up database connection, creating tables (users, orders)
            ├── controllers/
            │ ├── authController.js             # Registration, login, logout
            │ ├── clientController.js           # Creating an order, viewing your orders
            │ ├── masterController.js           # Managing orders, updating status, comments, prices
            │ └── adminController.js            # Managing orders, assigning masters, creating new orders and masters
            ├── middleware/
            │ └── authMiddleware.js             # Checking: is the user logged in? What is his role (client, master, admin)?
            ├── models/
            │ ├── index.js
            │ ├── User.js
            │ └── Order.js
            ├── public/
            │ ├── css/
            │ └── style.css
            ├── routes/
            │ ├── auth.js
            │ ├── client.js
            │ ├── master.js
            │ └── admin.js
            ├── views/
            │ ├── partials/
            │ ├── auth/
            │ │ ├── login.hbs
            │ │ └── register.hbs
            │ ├── client/
            │ │ ├── createClient.hbs          # Create clients
            │ │ └── dashboardClient.hbs       # View client orders
            │ ├── master/
            │ │ ├── dashboardMaster.hbs       # View and manage your orders
            │ │ ├── dashboardMaster.js
            │ │ ├── dashboardMaster.js
            │ │ ├── editMaster.hbs            # Editing your orders
            │ │ └── editMaster.js
            │ ├── admin/
            │ │ ├── createMasterAdmin.hbs     # page for creating masters by admin
            │ │ ├── createOrderAdmin.hbs      # Creating an order
            │ │ ├── dashboardAdmin.hbs        # View and manage all orders
            │ │ ├── dashboardAdmin.js
            │ └── editOrderAdmin.js           # Editing all orders
            │ ├── error.hbs
            │ ├── index.hbs
            │ └── loyout.hbs
            ├── .env
            └── app.js               

---

## Authors
- **Kateryna Sherepera:** *Master - Admin Developer*
- **Anna Luzhetska:** *Client - Auth Developer*
---
---
