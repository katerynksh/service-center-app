import express from 'express';
const router = express.Router

export const getAdminDashboardView = (req, res) => {
    res.render('admin/dashboardAdmin', { 
        title: 'Admin Dashboard', 
    });
};


export default router;