# Eight-minute demo recording script

Use a fresh database for a clean recording: stop the app, remove `data.sqlite`, start with `node start.js`, then record the browser at a readable desktop width. The seeded benchmark button performs the benchmark as one auditable scenario; pause on each screen so the visible ledger and reports can be read.

1. **0:00–0:40 — Context and roles.** Introduce the one-database flow and show the demo accounts from the README. Sign in as admin and point out the role-based sections.
2. **0:40–1:20 — Sales entry.** Sign out, sign in as `salesa`, submit Retailer A for 150 packets, and show the submitted order under Salesman A. Mention that orders entered while the page is open offline queue on the device and sync when connectivity returns.
3. **1:20–2:00 — Factory purchase.** Sign in as admin and record the 60 kg flour receipt at ₹45/kg from Inventory. Show the receipt movement and updated flour balance (160 kg before production).
4. **2:00–3:20 — Production.** Sign out and sign in as `floor`. Post one run: 188 good packets, 6 damaged pouches, 9 cartons, ₹1,200 labour and ₹600 utilities. Show 40 kg flour, 10.5 L oil, 1.2 kg spice, 194 pouches and 9 cartons issued, plus 188 finished packets received. Point to the −6% yield and +5% oil alerts and ₹31.14 unit cost.
5. **3:20–4:40 — Approval, invoice, dispatch.** Return to admin, approve the submitted Retailer A order, open the generated GST invoice PDF and dispatch it. Explain the ₹7,500 taxable amount and ₹187.50 each of CGST and SGST.
6. **4:40–5:20 — Stock shortage.** Submit Distributor B's 120 packet request as `salesb`; as admin, try approval. Show the 32 packet shortage and that no invoice/dispatch is posted.
7. **5:20–6:00 — Collection.** Record the ₹4,000 Retailer A payment and show ₹3,875 outstanding.
8. **6:00–7:10 — Audit outputs.** Sign in as `audit`, show the sales/GST and production reports, then download sales, stock and ledger CSVs. Mention that date filtering and ageing are listed as remaining work.
9. **7:10–8:00 — Design summary.** Show the stock ledger and explain that balances are movements summed from opening stock, receipts, issues, output and dispatch. Close with the weighted-average flour rate and the documented assumptions.

For a shorter recording, skip the manual order-entry and purchase steps and use the admin **Run benchmark demo** button, then demonstrate the shortage check, reports and exported files.
