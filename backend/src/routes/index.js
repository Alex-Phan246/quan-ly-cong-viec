import express from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { authRequired, signToken } from '../middleware/auth.js';
import { usersData, nextUserId } from '../data/users.js';
import { productsData } from '../data/products.js';
import { cartsData } from '../data/carts.js';
import { ordersData, nextOrderId } from '../data/orders.js';
import { isValidEmail, isStrongPassword, toNumber, paginate } from '../utils/validate.js';

export const router = express.Router();

// Health
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth
router.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Email không hợp lệ' });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'Mật khẩu tối thiểu 6 ký tự' });
  }
  const exists = usersData.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'Email đã tồn tại' });
  }
  const user = {
    id: (global.__nextUserId = (global.__nextUserId || nextUserId)),
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 8),
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  usersData.push(user);
  global.__nextUserId += 1;
  return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = usersData.find(u => u.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.passwordHash)) {
    return res.status(401).json({ message: 'Thông tin đăng nhập không đúng' });
  }
  const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.get('/me', authRequired, (req, res) => {
  const user = usersData.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// Products list, filter, sort, paginate
router.get('/products', (req, res) => {
  const { q, category, minPrice, maxPrice, sortBy, order, page = '1', pageSize = '12' } = req.query || {};
  let list = [...productsData];
  if (q) {
    const term = String(q).toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(term));
  }
  if (category) {
    list = list.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }
  const min = toNumber(minPrice, undefined);
  const max = toNumber(maxPrice, undefined);
  if (min !== undefined) list = list.filter(p => p.price >= min);
  if (max !== undefined) list = list.filter(p => p.price <= max);
  if (sortBy) {
    const isAsc = String(order || 'asc').toLowerCase() !== 'desc';
    list.sort((a, b) => {
      if (sortBy === 'price') return isAsc ? a.price - b.price : b.price - a.price;
      if (sortBy === 'name') return isAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      return 0;
    });
  }
  const pageNum = toNumber(page, 1);
  const sizeNum = toNumber(pageSize, 12);
  const result = paginate(list, pageNum, sizeNum);
  return res.json(result);
});

router.get('/products/featured', (req, res) => {
  return res.json(productsData.filter(p => p.featured));
});

router.get('/products/:id', (req, res) => {
  const id = Number(req.params.id);
  const product = productsData.find(p => p.id === id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  const related = productsData.filter(p => p.category === product.category && p.id !== product.id).slice(0, 8);
  return res.json({ product, related });
});

// Cart
router.get('/cart', authRequired, (req, res) => {
  const userId = req.user.id;
  const cart = cartsData.get(userId) || { userId, items: [] };
  return res.json(cart);
});

router.post('/cart', authRequired, (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body || {};
  const product = productsData.find(p => p.id === Number(productId));
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const qty = Math.max(1, Number(quantity) || 1);
  const cart = cartsData.get(userId) || { userId, items: [] };
  const existing = cart.items.find(i => i.productId === product.id);
  if (existing) existing.quantity += qty;
  else cart.items.push({ productId: product.id, quantity: qty });
  cartsData.set(userId, cart);
  return res.status(201).json(cart);
});

router.put('/cart/:productId', authRequired, (req, res) => {
  const userId = req.user.id;
  const productId = Number(req.params.productId);
  const { quantity } = req.body || {};
  const qty = Math.max(0, Number(quantity) || 0);
  const cart = cartsData.get(userId) || { userId, items: [] };
  const idx = cart.items.findIndex(i => i.productId === productId);
  if (idx === -1) return res.status(404).json({ message: 'Item not in cart' });
  if (qty === 0) cart.items.splice(idx, 1);
  else cart.items[idx].quantity = qty;
  cartsData.set(userId, cart);
  return res.json(cart);
});

router.delete('/cart/:productId', authRequired, (req, res) => {
  const userId = req.user.id;
  const productId = Number(req.params.productId);
  const cart = cartsData.get(userId) || { userId, items: [] };
  cart.items = cart.items.filter(i => i.productId !== productId);
  cartsData.set(userId, cart);
  return res.json(cart);
});

// Checkout / Orders
router.post('/checkout', authRequired, (req, res) => {
  const userId = req.user.id;
  const { fullName, phone, address } = req.body || {};
  if (!fullName || !phone || !address) return res.status(400).json({ message: 'Thiếu thông tin giao hàng' });
  const cart = cartsData.get(userId);
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Giỏ hàng trống' });
  const itemsDetailed = cart.items.map(i => {
    const product = productsData.find(p => p.id === i.productId);
    return { productId: i.productId, name: product.name, price: product.price, quantity: i.quantity };
  });
  const total = itemsDetailed.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order = {
    id: (global.__nextOrderId = (global.__nextOrderId || nextOrderId)),
    userId,
    items: itemsDetailed,
    total,
    shipping: { fullName, phone, address },
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  ordersData.push(order);
  global.__nextOrderId += 1;
  cartsData.set(userId, { userId, items: [] });
  return res.status(201).json(order);
});

router.get('/orders', authRequired, (req, res) => {
  const userId = req.user.id;
  const list = ordersData.filter(o => o.userId === userId);
  return res.json(list);
});

router.get('/orders/:id', authRequired, (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);
  const order = ordersData.find(o => o.id === id && o.userId === userId);
  if (!order) return res.status(404).json({ message: 'Not found' });
  return res.json(order);
});
