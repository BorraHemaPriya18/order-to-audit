const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(process.env.DB_PATH || 'data.sqlite');
db.exec(`PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT);
CREATE TABLE IF NOT EXISTS customers(id INTEGER PRIMARY KEY, name TEXT, state TEXT, gstin TEXT);
CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY, name TEXT UNIQUE, kind TEXT, unit TEXT, opening REAL DEFAULT 0, reorder REAL DEFAULT 0);
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, name TEXT UNIQUE, hsn TEXT, price_paise INTEGER, gst REAL, batch_yield INTEGER);
CREATE TABLE IF NOT EXISTS bom(product_id INTEGER, item_id INTEGER, qty REAL, unit TEXT, rate_paise INTEGER, PRIMARY KEY(product_id,item_id));
CREATE TABLE IF NOT EXISTS movements(id INTEGER PRIMARY KEY, item_id INTEGER, qty REAL, source TEXT, ref TEXT, note TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS runs(id INTEGER PRIMARY KEY, product_id INTEGER, expected INTEGER, actual INTEGER, scrap INTEGER, labour_paise INTEGER, utilities_paise INTEGER, created_by TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS run_lines(run_id INTEGER, item_id INTEGER, planned REAL, actual REAL, rate_paise INTEGER);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY, customer_id INTEGER, salesman TEXT, qty INTEGER, price_paise INTEGER, status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, client_ref TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS invoices(id INTEGER PRIMARY KEY, order_id INTEGER, number TEXT UNIQUE, taxable_paise INTEGER, cgst_paise INTEGER, sgst_paise INTEGER, igst_paise INTEGER, status TEXT DEFAULT 'posted', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS payments(id INTEGER PRIMARY KEY, invoice_id INTEGER, amount_paise INTEGER, ref TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, actor TEXT, action TEXT, entity TEXT, entity_id INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS purchases(id INTEGER PRIMARY KEY, item_id INTEGER, qty REAL, rate_paise INTEGER, supplier TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS credit_notes(id INTEGER PRIMARY KEY, invoice_id INTEGER, number TEXT UNIQUE, qty INTEGER, taxable_paise INTEGER, cgst_paise INTEGER, sgst_paise INTEGER, igst_paise INTEGER, reason TEXT, stock_returned INTEGER DEFAULT 0, created_by TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);`);
const count = db.prepare('SELECT COUNT(*) n FROM users').get().n;
if (!db.prepare('PRAGMA table_info(orders)').all().some(c=>c.name==='client_ref')) db.exec('ALTER TABLE orders ADD COLUMN client_ref TEXT');
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS orders_client_ref_idx ON orders(client_ref) WHERE client_ref IS NOT NULL');
if (!count) {
 const tx=()=>{db.exec('BEGIN IMMEDIATE');try{
  for(const u of [['admin','admin123','admin'],['salesa','sales123','salesman'],['salesb','sales123','salesman'],['floor','floor123','production'],['audit','audit123','auditor'],['owner','owner123','owner']]) db.prepare('INSERT INTO users(username,password,role) VALUES(?,?,?)').run(...u);
  db.prepare('INSERT INTO customers VALUES(1,?,?,?)').run('Retailer A','Tamil Nadu','33AAAAA0000A1Z5'); db.prepare('INSERT INTO customers VALUES(2,?,?,?)').run('Distributor B','Karnataka','29BBBBB0000B1Z6');
  const item=db.prepare('INSERT INTO items(name,kind,unit,opening,reorder) VALUES(?,?,?,?,?)');
  for(const x of [['Flour','raw','kg',100,20],['Cooking oil','raw','litre',30,10],['Salt and spice mix','raw','kg',5,2],['200 g pouch','packaging','piece',500,100],['Carton','packaging','piece',30,10],['Murukku 200 g','finished','packet',50,40]]) item.run(...x);
  db.prepare('INSERT INTO products(id,name,hsn,price_paise,gst,batch_yield) VALUES(1,?,?,?,?,?)').run('Murukku 200 g','190590',5000,5,200);
  const b=db.prepare('INSERT INTO bom VALUES(1,?,?,?,?)'); for(const x of [[1,40,'kg',4200],[2,10,'litre',14000],[3,1.2,'kg',20000],[4,200,'piece',250],[5,10,'piece',1500]])b.run(...x);
  db.prepare("INSERT INTO movements(item_id,qty,source,ref,note) SELECT id,opening,'opening','OPENING','Seed opening balance' FROM items").run();
 }catch(e){db.exec('ROLLBACK');throw e}db.exec('COMMIT')}; tx();
}
db.close(); console.log('Seeded benchmark masters and demo users.');
