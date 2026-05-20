import express from 'express';
import * as admin from '../controllers/adminController.js';
import { isAdmin } from '../middleware/authMiddleware.js';
import { getAdminDashboardView } from '../views/admin/dashboardAdmin.js';
const router = express.Router();

router.get('/', isAdmin, getAdminDashboardView);
router.get('/edit/:id', isAdmin, admin.getEditPage);             
router.get('/create-order', isAdmin, (req, res) => {
    res.render('admin/createOrderAdmin', { 
        title: 'Create New Order' 
    });
});
router.put('/orders/:id', admin.updateOrderFull);        
router.delete('/orders/:id', admin.deleteOrder);         
router.post('/orders', admin.createOrderAdmin);       


router.get('/all-info', isAdmin, admin.getAllData);
router.get('/create-master', isAdmin, (req, res) => {
    res.render('admin/createMasterAdmin');
});
router.post('/masters', isAdmin, admin.createMaster);
router.put('/assign-master', isAdmin, admin.assignMaster);

export default router;