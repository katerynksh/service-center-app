// файл, де ви прописуються зв'язки (наприклад, що Замовлення належить Клієнту).

import User from './User.js';
import Order from './Order.js';

// Клієнт має багато замовлень
User.hasMany(Order, { foreignKey: 'client_id', as: 'clientOrders' });
Order.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

// Майстер може мати багато призначених замовлень
User.hasMany(Order, { foreignKey: 'assigned_to', as: 'masterOrders' });
Order.belongsTo(User, { foreignKey: 'assigned_to', as: 'technician' });

export { User, Order };   