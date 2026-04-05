import express from 'express';
import * as admin from '../controllers/adminController.js';
import { isAdmin } from '../middleware/authMiddleware.js';
import { getAdminDashboardView } from '../views/admin/dashboardAdmin.js';
const router = express.Router();

// Маршрути для адміна
// router.get('/dashboard', isAdmin, getAdminDashboardView);
router.get('/', getAdminDashboardView); //тестовий маршрут для відображення адмінської панелі без авторизації


// router.get('/all-info', isAdmin, admin.getAllData);
router.get('/all-info', admin.getAllData); //тестовий маршрут для отримання всіх даних без авторизації
router.post('/assign', isAdmin, admin.assignToMaster);

export default router;