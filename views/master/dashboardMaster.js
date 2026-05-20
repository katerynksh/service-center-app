import express from 'express';
const router = express.Router

export const getMasterDashboardView = (req, res) => {
    res.render('master/dashboardMaster', { 
        title: 'Master Dashboard', 
    });
};


export default router;