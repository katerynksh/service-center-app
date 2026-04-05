import express from 'express';
import * as master from '../controllers/masterController.js';
import { isMaster } from '../middleware/authMiddleware.js';
import { getEditMasterView } from '../views/master/editMaster.js';

const router = express.Router();

router.get('/', (req, res) => {
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
router.put('/order/:id', isMaster, master.updateOrder);


export default router;