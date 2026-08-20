const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/#\{String\(order\.id\)\.substring\(0, 6\)\.toUpperCase\(\)\}/g, "{order.job_order_id || '#' + String(order.id).substring(0, 6).toUpperCase()}");
content = content.replace(/Order #\{String\(order\.id\)\.substring\(0, 8\)\}/g, "Order {order.job_order_id || '#' + String(order.id).substring(0, 8)}");
content = content.replace(/#\{String\(order\.id \|\| ''\)\.substring\(0, 8\)\.toUpperCase\(\)\}/g, "{order.job_order_id || '#' + String(order.id || '').substring(0, 8).toUpperCase()}");
content = content.replace(/#\{String\(order\.id\)\.substring\(0, 8\)\.toUpperCase\(\)\}/g, "{order.job_order_id || '#' + String(order.id).substring(0, 8).toUpperCase()}");
content = content.replace(/#\{String\(selectedOrder\.id \|\| ''\)\.substring\(0, 8\)\.toUpperCase\(\)\}/g, "{selectedOrder.job_order_id || '#' + String(selectedOrder.id || '').substring(0, 8).toUpperCase()}");

fs.writeFileSync('src/App.tsx', content);
