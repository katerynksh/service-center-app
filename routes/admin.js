import express from 'express';
import * as admin from '../controllers/adminController.js';
import { isAdmin } from '../middleware/authMiddleware.js';
import { getAdminDashboardView } from '../views/admin/dashboardAdmin.js';
const router = express.Router();

// Маршрути для адміна
// router.get('/dashboard', isAdmin, getAdminDashboardView);
router.get('/', getAdminDashboardView); //тестовий маршрут для відображення адмінської панелі без авторизації
router.get('/edit/:id', admin.getEditPage);              // Сторінка редагування
router.get('/create-order', (req, res) => {
    res.render('admin/createOrderAdmin', { 
        title: 'Create New Order' 
    });
});
router.put('/orders/:id', admin.updateOrderFull);        // API для оновлення
router.delete('/orders/:id', admin.deleteOrder);         // API для видалення
router.post('/orders', admin.createOrderAdmin);       // API для створення нового замовлення адміном


// router.get('/all-info', isAdmin, admin.getAllData);
router.get('/all-info', admin.getAllData); //тестовий маршрут для отримання всіх даних без авторизації
router.get('/create-master', (req, res) => {
    res.render('admin/createMasterAdmin');
});
router.post('/masters', admin.createMaster);
router.put('/assign-master', admin.assignMaster);
// router.post('/assign-master', isAdmin, admin.assignMaster);

export default router;