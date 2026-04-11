import express from 'express';
import * as master from '../controllers/masterController.js';
import { isMaster } from '../middleware/authMiddleware.js';
import { getEditMasterView } from '../views/master/editMaster.js';
import { getMasterDashboardView } from '../views/master/dashboardMaster.js';


const router = express.Router();

router.get('/', getMasterDashboardView, (req, res) => {
res.render('master/dashboardMaster')
});

// router.get('/edit/:id', isMaster, getEditMasterView); {
  // res.render('master/editMaster', {
  //     title: 'Edit Order',}
router.get('/edit/:id', getEditMasterView, (req, res) => { //тестoвий маршрут для отримання сторінки редагування замовлення майстром без авторизації// 
  res.render('master/editMaster')
});

// router.get('/order-details/:id', isMaster, master.getOrderDetails);
router.get('/order-details/:id', master.getOrderDetails); //тестoвий маршрут для отримання деталей замовлення майстром без авторизації

// router.get('/dashboard', isMaster, master.getDashboard); 
router.get('/dashboard', master.getDashboard); //тестовий маршрут для отримання даних майстра без авторизації

router.put('/order/:id', master.updateOrder); //тестовий маршрут для оновлення замовлення майстром без авторизації
// router.put('/order/:id', isMaster, master.updateOrder);

router.put('/order/accept/:id', master.acceptOrder); //тестовий маршрут для прийняття замовлення майстром без авторизації
// router.put('/order/accept/:id', isMaster, master.acceptOrder);

export default router;