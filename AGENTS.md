# Repository Guidelines

## Project Structure

- `server.js` sets up Express, serves the browser UI, mounts the API under `/api`, and serves printable invoices at `/orders/:id/invoice`.
- `routes/` handles product, order, customer, and report requests. Put reusable business rules in `lib/`, which owns pricing, GST, coupons, stock, khata, invoices, and persistence.
- `public/` contains the browser UI in `index.html`, `js/app.js`, and `css/style.css`. See `docs/architecture.svg` for the order flow.
- `config.js` holds shop settings, GST rates, and coupon rules. `data/db.json` is the writable store for stock, orders, customer balances, settlements, and audit entries.

## Local Development

- `npm install` installs the dependencies listed in `package.json`.
- `npm start` runs `node server.js`. Open `http://localhost:3000` or set `PORT` to use a different port. The app serves static assets directly, with no build step.
- `npm test` is a placeholder that exits with an error. The repository has no automated test suite, framework, test naming convention, or coverage target.

## Code Style

Use two-space indentation, single quotes, and semicolons in JavaScript. Follow the existing CommonJS `require` and `exports` patterns and use camelCase for functions and variables. Name modules by responsibility, as in `lib/pricing.js`. Keep HTTP handling in the router and reusable calculations in library modules. The project has no configured formatter or linter.

## Verification

Use a disposable checkout or copy for manual checks that write to the database. For billing changes, preview and place a cart with mixed GST slabs and a coupon, then compare the saved totals, printable invoice, and reconciliation report. For stock or khata changes, check the resulting quantities and customer balance after placement and cancellation. Record observed differences and keep incidental changes to `data/db.json` out of the diff.

## Commits and Pull Requests

Recent commit subjects are short, lowercase descriptions without prefixes, such as `invoice page for accountant`. In a pull request, describe the behavior change and how you verified it. Link the related issue when one exists and include screenshots for visible changes. Use sample data in screenshots and examples.
