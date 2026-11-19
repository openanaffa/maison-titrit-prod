# Inventory SOP — Maison Titrit (FR / AR / EN)

Standard operating procedure for managing the 14-product catalogue and stock.

---

## FR — Procédure d'inventaire

### 1. Compte physique (en magasin)
À chaque visite en magasin, compter chaque article de la collection Maison Titrit (14 références). Noter la quantité sur la feuille d'inventaire Google Sheets.

**Références :** MT-NOUR, MT-YASMINE, MT-AMAL, MT-AZUR, MT-SABLE, MT-TERRACOTTA, MT-SAHAR, MT-EMERAUDE, MT-NOIR, MT-SAHEL, MT-GRENAT, MT-ROYAL, MT-ETOILE, MT-CUIVRE.

### 2. Mise à jour de la feuille
Ouvrir `inventory-template.csv` dans Google Sheets. Pour chaque produit :
- `stock_qty` : quantité comptée
- `in_stock` : `true` si `stock_qty > 0`, sinon `false`
- `last_scan` : date du jour (AAAA-MM-JJ)

### 3. Synchronisation site web
Après mise à jour de la feuille, prévenir l'équipe technique pour synchroniser `web/src/config/products.ts` et pousser vers Supabase (`bun run seed:prod` depuis `web/`).

### 4. Règles
- Un produit `in_stock: false` affiche le badge "Rupture de stock" et ne peut pas être commandé.
- Le flux produit (`/feed.xml`) ne publie que les produits `in_stock: true`.
- Les prix et matières marqués "à confirmer" doivent être validés avant mise en ligne.

---

## AR — إجراء جرد المخزون

### 1. الجرد البدني (في المتجر)
في كل زيارة للمتجر، نعد كل قطعة من مجموعة Maison Titrit (14 مرجعًا). ندون الكمية في ورقة جرد Google Sheets.

**المراجع:** MT-NOUR, MT-YASMINE, MT-AMAL, MT-AZUR, MT-SABLE, MT-TERRACOTTA, MT-SAHAR, MT-EMERAUDE, MT-NOIR, MT-SAHEL, MT-GRENAT, MT-ROYAL, MT-ETOILE, MT-CUIVRE.

### 2. تحديث الورقة
فتح `inventory-template.csv` في Google Sheets. لكل منتج:
- `stock_qty`: الكمية المعدودة
- `in_stock`: `true` إذا كان `stock_qty > 0`، وإلا `false`
- `last_scan`: تاريخ اليوم (YYYY-MM-DD)

### 3. مزامنة الموقع الإلكتروني
بعد تحديث الورقة، إخطار الفريق التقني لمزامنة `web/src/config/products.ts` والدفع إلى Supabase (`bun run seed:prod` من `web/`).

### 4. القواعد
- منتج `in_stock: false` يظهر شارة "نفذ المخزون" ولا يمكن طلبه.
- التغذية (`/feed.xml`) تنشر فقط المنتجات `in_stock: true`.
- الأسعار والمواد المكتوب عليها "يجب تأكيدها" يجب التحقق منها قبل النشر.

---

## EN — Inventory SOP

### 1. Physical count (in store)
At each store visit, count every item in the Maison Titrit collection (14 references). Record quantities in the Google Sheets inventory.

**References:** MT-NOUR, MT-YASMINE, MT-AMAL, MT-AZUR, MT-SABLE, MT-TERRACOTTA, MT-SAHAR, MT-EMERAUDE, MT-NOIR, MT-SAHEL, MT-GRENAT, MT-ROYAL, MT-ETOILE, MT-CUIVRE.

### 2. Update the sheet
Open `inventory-template.csv` in Google Sheets. For each product:
- `stock_qty`: counted quantity
- `in_stock`: `true` if `stock_qty > 0`, else `false`
- `last_scan`: today's date (YYYY-MM-DD)

### 3. Sync to website
After updating the sheet, notify the technical team to sync `web/src/config/products.ts` and push to Supabase (`bun run seed:prod` from `web/`).

### 4. Rules
- A product `in_stock: false` shows an "Out of stock" badge and cannot be ordered.
- The product feed (`/feed.xml`) only publishes `in_stock: true` products.
- Prices and materials marked "to confirm" must be validated before going live.
