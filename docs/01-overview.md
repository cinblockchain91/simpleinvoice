# Overview

SimpleInvoice is a fully responsive web application that allows authenticated users to:

- **Login** via OAuth2 password grant (proxied through the BFF — credentials never leave the server)
- **List invoices** with search, sorting, filtering by status, and pagination
- **Create invoices** with a single line item, date validation, and real-time form feedback
- **View invoice detail** by clicking any row in the invoice list

All communication with the 101 Digital API is proxied through Next.js Route Handlers. The browser never holds or transmits authentication tokens directly.
