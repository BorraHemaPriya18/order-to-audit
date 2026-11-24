# Order to Audit

A runnable internship prototype for a small packaged snack manufacturer. The demo follows an order from salesperson entry through admin approval, GST invoice, dispatch, stock ledger, collections and month end reporting. The production path records a BOM issue, good output, damaged packaging, yield and oil variances, and run cost.

## Run locally

Requires Node.js 22.5 or newer (the built-in `node:sqlite` module is used; no package install is needed).

```powershell
node start.js
```

To run the same app in Docker with a persistent SQLite volume, use `docker compose up --build`.

For a hosted demo, the included [render.yaml](render.yaml) provisions a Docker web service and persistent disk when the repository is connected to Render. Set the service port to the platform-provided `PORT` if deploying elsewhere. A live public link still requires deploying this repository under an account.

Open <http://localhost:3000>. Startup seeds the SQLite database only if it has no users. To reset the demo, stop the server, delete `data.sqlite`, then run `node start.js` again. The benchmark button is intentionally one-shot per database so accidental duplicate postings cannot inflate stock. If npm is available, `npm start` and `npm test` are also configured.

Run the arithmetic tests directly with `node --test` (or `npm test` where npm is available).

The suggested walkthrough for an 8-minute submission recording is in [DEMO_SCRIPT.md](DEMO_SCRIPT.md).

### Demo logins

| Role | Username | Password |
| --- | --- | --- |
| Factory admin | `admin` | `admin123` |
| Salesman A | `salesa` | `sales123` |
| Salesman B | `salesb` | `sales123` |
| Production | `floor` | `floor123` |
| Auditor | `audit` | `audit123` |
| Owner | `owner` | `owner123` |

These are sample-only credentials. This prototype is not suitable for production deployment without password hashing, CSRF protections, secure session storage, HTTPS, and operational controls.

## Suggested benchmark walkthrough

1. Sign in as `admin`, select **Run benchmark demo**, and confirm the summary.
2. Review the production and inventory tabs: flour is 120 kg; oil 19.5 L; pouches 306; finished stock 88 packets. The run reports yield −6%, oil +5%, and cost about ₹31.14 per good packet.
3. In the orders tab, try approving Distributor B. The server rejects it with the 32 packet shortage. A 5% IGST calculation is implemented for an interstate invoice if stock becomes available.
4. Open reports: Retailer A has ₹7,500 taxable value, CGST/SGST ₹187.50 each, ₹7,875 total, ₹4,000 collected, and ₹3,875 outstanding. CSV exports are available there. The order queue links to a PDF invoice.
5. For the source-entry sequence in a demo recording, reset the database and show Salesman A submit 150, then sign in as admin to approve and dispatch. Use the production role for a manual run, or use the benchmark button to populate the canonical scenario.

## What is implemented

**Must have:** role-based demo login; seeded customer/product/raw-material/BOM masters; responsive order entry; admin order edit, reject, stock check and approval; GST tax invoice PDF; production posting with actual material issues, output, scrap and overhead; BOM/yield variance flags; ledger-derived stock balances; monthly reports with date filters, PDF and CSV exports.

**Should have:** purchase receipt and supplier/purchase register; invoice payments and credit notes; receivables ageing; per-run material and overhead cost; owner overview and reorder alerts; outward GST summary.

**Implemented:** multiple product lines per order; product-specific finished-stock ledgers; admin order edits by line; partial dispatch; customer, inventory item, product, and BOM setup; BOM-driven production runs; compatible unit conversion across g/kg, ml/litre, pieces/packets, and carton-to-packet using the product pack size; purchase receipts for any stock item; batch/expiry receipts; and saved historical stock snapshots. Sales register, customer sales, product-wise sales CSV, GST, purchases, stock, ledger, production and collections exports are available. Offline orders are queued in the browser and sync with duplicate protection.

**Known gaps:** batch receipts are traceable, but stock is not allocated or dispatched FEFO by lot; production output is not assigned a finished-goods lot; credit-note stock returns are designed around the seeded benchmark SKU; Tally/accounting sync, e-invoice, route tracking, and Tamil UI are not included. Historical balances are available at explicitly saved snapshot times, not for arbitrary past timestamps. Ageing uses invoice date and 30-day bands because the brief supplies no payment terms. This remains a shortlist prototype, not a production GST/accounting system.

## Stack and rationale

This is a small Node.js HTTP application with a responsive browser interface and embedded SQLite database. It avoids a service dependency so reviewers can launch the same transaction flow with one command, while SQLite constraints and the stock movement journal make the data model easy to inspect. Money is stored in integer paise; quantities are decimal values in each item's base unit.

## Benchmark results and assumptions

| Check | Result |
| --- | ---: |
| Flour | 100 + 60 − 40 = **120 kg** |
| Cooking oil | 30 − 10.5 = **19.5 L** |
| Pouches | 500 − 188 good − 6 damaged = **306** |
| Cartons | 30 − 9 = **21** |
| Finished Murukku 200 g after run | 50 + 188 = **238 packets** |
| Finished goods after dispatch | 238 − 150 = **88 packets** |
| Yield variance | (188 − 200) / 200 = **−6%**, flagged above 3% |
| Oil variance | (10.5 − 10) / 10 = **+5%**, flagged above 3% |
| Retailer A GST invoice | ₹7,500 taxable + ₹187.50 CGST + ₹187.50 SGST = **₹7,875** |
| Retailer A balance | ₹7,875 − ₹4,000 = **₹3,875** |
| Distributor B | 120 requested, 88 available, **32 short**; approval is blocked |
| Run cost | **₹31.14 per good packet** (approx.) |

Costing uses moving weighted-average flour cost: (100 kg × ₹42 + 60 kg × ₹45) / 160 kg = ₹43.125/kg, rounded to ₹43.13/kg for the run. Other BOM input rates use the supplied rates. Actual run material cost is ₹4,055.20 (flour ₹1,725.20; oil ₹1,470; spice ₹240; 194 pouches ₹485; 9 cartons ₹135). Labour and gas/power add ₹1,800. Dividing ₹5,855.20 by 188 good packets gives ₹31.1447, shown as ₹31.14. Damaged pouches are included in consumed packaging cost. The benchmark explicitly issues the BOM's 40 kg flour; oil is the only raw input above standard. Each material extension is rounded to whole paise before summing; the displayed per-packet amount is also rounded to paise.

Ageing buckets use invoice date and 30-day bands as a documented assumption; they are not contractual overdue ageing because no due dates were supplied. Report range filters apply to invoices, purchases and collections. Stock and movement exports show current balances/history; the inventory screen also lists manually saved historical snapshots.

The demo applies a local GST assumption: same-state TN customer means CGST and SGST at 2.5% each; Karnataka customer would use 5% IGST. This is a simplified exercise rule, not a tax advisory. Invoice numbering uses the current system financial year, so an old historical date is not inferred from the prompt.

## Data and transaction design

See [ARCHITECTURE.md](ARCHITECTURE.md) for the table map, stock invariants, posting behavior and limits.
