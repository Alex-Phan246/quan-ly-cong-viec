import { usersData } from '../data/users.js';
import { productsData } from '../data/products.js';
import { cartsData } from '../data/carts.js';
import { ordersData } from '../data/orders.js';

export function resetInMemoryStore() {
  cartsData.clear();
  ordersData.length = 0;
}

export function getSeed() {
  return {
    users: usersData,
    products: productsData,
  };
}
