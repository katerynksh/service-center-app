import express from 'express';
const router = express.Router

export const getAdminDashboardView = (req, res) => {
    res.render('admin/dashboardAdmin', { 
        title: 'Панель Адміністратора' 
    });
};

export default router;