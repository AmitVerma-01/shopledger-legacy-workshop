# Repository Guidelines

## Stack

ShopLedger uses Node.js with CommonJS modules, Express 4, and `body-parser` for the server and API. The browser UI is plain HTML, CSS, and JavaScript. Application data is stored in `data/db.json`; business and shop settings are in `config.js`.

## Module Map

- `server.js`: configures Express, serves `public/`, and mounts API routes.
- `routes/`: `products.js`, `orders.js`, `customers.js`, and `reports.js` handle the corresponding API endpoints.
- `lib/`: order lifecycle (`orders.js`), stock (`inventory.js`), prices and tax (`pricing.js`, `tax.js`, `coupons.js`), customer credit (`ledger.js`), invoice/reporting (`invoice.js`, `reports.js`), dates (`dates.js`), and JSON persistence (`store.js`).
- `public/`: `index.html`, `js/app.js`, and `css/style.css` implement the UI.
- `data/db.json`: local products, orders, customers, settlements, and audit log.

## Commands

- `npm start`: start the app on port 3000, or the port configured by `PORT`.
- `npm test`: currently a placeholder that exits with “Error: no test specified”; no test framework is configured.
- `node --check <file>`: check JavaScript syntax, for example `node --check routes/orders.js`.

## Change and Test Rules

- Before changing behavior, write characterization tests that capture the current behavior.
- Change only the module the ticket is about. Do not make unrelated or cross-module cleanup changes.
- Tests must never read or write `data/db.json`; use isolated test data instead.
- Add no dependencies. Use the packages already declared in `package.json` and built-in Node.js capabilities.
