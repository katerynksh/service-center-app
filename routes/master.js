import express from 'express';
import * as master from '../controllers/masterController.js';
import { isMaster } from '../middleware/authMiddleware.js';
import { getEditMasterView } from '../views/master/editMaster.js';
import { getMasterDashboardView } from '../views/master/dashboardMaster.js';


const router = express.Router();

router.get('/', getMasterDashboardView, (req, res) => {
res.render('master/dashboardMaster')
});

router.get('/edit/:id', isMaster, getEditMasterView, (req, res) => {
  res.render('master/editMaster', {
      title: 'Edit Order'
  });
});

router.get('/order-details/:id', isMaster, master.getOrderDetails);

router.get('/dashboard', isMaster, master.getDashboard); 

router.put('/order/:id', isMaster, master.updateOrder);

router.put('/order/accept/:id', isMaster, master.acceptOrder);

export default router;