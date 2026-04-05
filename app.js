import express from 'express';
import dotenv from 'dotenv';
import hbs from 'hbs';
import path from 'path';
dotenv.config();
const app = express()


app.get('/', (req, res) => {
  res.send('Service-Center App')
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoutes from './routes/auth.js';
import masterRoutes from './routes/master.js';
import adminRoutes from './routes/admin.js';
import clientRoutes from './routes/client.js';
import masterViewRoutes from './views/master/editMaster.js';

app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/master', masterViewRoutes);


app.set('view engine', 'hbs');
app.set('views', './views');
hbs.registerPartials(path.join(process.cwd(), 'views/partials'));
hbs.registerHelper('eq', (a, b) => a === b);
app.use((req, res, next) => {
    res.locals.user = req.user || null; // Якщо залогінений, дані будуть доступні в hbs
    next();
});

const PORT = process.env.PORT 

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})

