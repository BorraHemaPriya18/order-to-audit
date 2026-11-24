# Design note: Order to Audit

## Data model

```text
users ──< audit
customers ──< orders ──< order_lines >── products ──< bom >── items ──< movements
orders ──0..1 invoices ──< payments
orders ──< order_dispatches ──< order_dispatch_lines >── products
items ──< batches
items ──< stock_snapshot_lines >── stock_snapshots
products ──< runs ──< run_lines >── items
items ──< purchases
```

`items` holds raw, packaging and finished-good definitions. `products` holds sellable SKU details. `bom` connects a sellable SKU to its ingredient/packaging quantities per standard batch. `orders` capture the submitted sales request and salesperson; `order_lines` store each SKU, quantity, and price. Every product links to a finished-stock item. Approval checks each linked ledger before creating the tax invoice; each partial dispatch records its product quantities and negative stock movements. `runs` and `run_lines` preserve the expected/actual yield and expected/actual issue for each ingredient. Each event also writes an `audit` entry with actor and timestamp. `purchases` records receipt metadata, and every receipt creates its own positive stock movement.

## Stock and BOM calculations

Stock on hand is computed as `SUM(movements.qty)` for an item. The opening balance is represented as a movement whose source is `opening`; it is not an independently editable balance. Purchases and production output are positive. Production issues, dispatches and scrap/packaging consumption are negative. Every movement records a source type, source document reference, note and timestamp.

For the 200 packet Murukku batch, the BOM plans 40 kg flour, 10 L oil, 1.2 kg spice mix, 200 pouches and 10 cartons. The benchmark posts actual consumption of 40 kg flour, 10.5 L oil, 1.2 kg spice, 194 pouches (188 good plus 6 damaged), and 9 cartons. The output movement is +188 packets. A run is refused if any required component is below zero after issue. Yield variance is `(actual output − expected output) / expected output`; consumption variance is `(actual issue − planned issue) / planned issue`. The demo flags absolute yield and consumption variance above 3%.

Stock movements use each item’s declared base unit. BOM and purchase entry convert compatible g/kg, ml/litre, piece/packet units; carton-to-packet conversion uses the product pack size. Batch receipts save code and expiry metadata. Manual snapshots save all item balances for later historical review.

## Tax, numbering and costing

Amounts on invoices and payments are integer paise. The demo uses 5% GST: within Tamil Nadu, 2.5% CGST plus 2.5% SGST; for another state, 5% IGST. Tax is rounded to the nearest paise. Invoice IDs are sequential within the current financial year. The invoice PDF is a simple printable summary generated without external dependencies.

Run cost is direct consumed quantity times rate plus labour and utilities, divided by good packets. Flour uses a moving weighted-average purchase cost in the benchmark: opening flour at ₹42/kg and the new 60 kg receipt at ₹45/kg yield ₹43.125/kg. Remaining BOM rates follow the scenario's listed rates. This is approximate product costing: there is no allocation of monthly overhead, work-in-progress valuation, FIFO lot valuation or inventory valuation journal. Batch stock is not allocated FEFO during issue or dispatch.

## Access and audit boundary

The API checks the user's role before orders, production, stock, reports and invoice actions. Salespeople see their own order list. Admin owns approval, dispatch and collections. Production can post runs and receipts. Auditor has read-only report/ledger routes. The browser session map and demo passwords are intentionally simple; this is not a production security design. Submitted orders can be edited or rejected by admin with an audit entry. Posted invoices are corrected through quantity-based credit notes; they are not deleted. The demo does not yet provide full before/after snapshots for every edit.


## Offline capture, reports and reversals

The service worker caches the app shell. A salesperson who has signed in online can reopen the cached shell, enter an order while disconnected, and keep it in browser local storage. On reconnect, the client submits the queue with a stable `client_ref`; the server returns the existing order for a repeated reference. This requires the same browser profile and does not provide encrypted local storage.

Reports filter invoices, purchases and collections by creation date and export CSV. The PDF is a concise printable audit summary. Ageing uses invoice age bands (0–30, 31–60, 61–90, over 90 days) because due dates were not provided. A credit note is quantity-based, proportionally reverses the invoice tax components, records the actor and reason, and can add accepted returns back into finished goods. Cumulative proportional rounding ensures the final partial credit note does not drift by paise.
