const res = await fetch('http://localhost:3000/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser1',
    password: 'password123',
    role: 'operator',
    full_name: 'Test',
    staff_id: 'Test-1',
  }),
});
console.log('users status:', res.status);
console.log('users response:', await res.text());

const res2 = await fetch('http://localhost:3000/api/inventory', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    item_name: 'TestItem',
    stock: 10,
    opening_stock: 10,
    minimum_stock: 5,
    unit: 'pcs',
    is_service: 0,
    service_price: 0,
    category: 'Test'
  }),
});
console.log('inventory status:', res2.status);
console.log('inventory response:', await res2.text());
