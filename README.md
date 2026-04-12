# ShopFlow AI — Shop Management System

## Live Demo
https://tranksp.github.io/shopmanagementAI/

## Files
- `index.html` — Main app (12 screens)
- `styles.css` — Mobile-first design system (single shared stylesheet)
- `app.js` — Navigation, bay data, charts
- `shopfloor.html` — Shop Floor Live View (SVG overhead)
- `techproductivity.html` — Technician productivity charts
- `parts.html` — Parts & Inventory management
- `multilocation.html` — Multi-location network dashboard
- `customer.html` — Customer vehicle status tracker

## Architecture
- Mobile-first CSS: base = mobile, desktop added via min-width:769px
- body { display:block } — prevents mobile viewport collapse
- Sidebar hidden by default, shown on desktop via min-width media query
- Google Analytics: G-6XJ6CNV95V

## Tech Tiers (lowest to highest)
1. Maintenance Tech — oil change, tires, flat repair
2. Maintenance Tech C — battery, filters, rotation
3. Maintenance Tech B — brakes, alignment, inspection, steering
4. Maintenance Tech A — A/C, engine diagnostic, transmission, timing belt

## 8 Bays
B1: Chassis Lift | B2: Drive-on | B3: Drive-on | B4: Drive-on
B5: Chassis Lift | B6: Chassis Lift | B7: Alignment Rack | B8: Drive-on

Built April 2026
