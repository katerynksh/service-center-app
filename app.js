import express from "express";
import dotenv from "dotenv";
import hbs from "hbs";
import path from "path";
import session from "express-session";

import { setUser, requireAuth, requireRole } from "./middleware/authMiddleware.js";

import authRoutes from "./routes/auth.js";
import masterRoutes from "./routes/master.js";
import adminRoutes from "./routes/admin.js";
import clientRoutes from "./routes/client.js";

dotenv.config();
const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key', 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 1000 * 60 * 15 
  },
  name: 'sid' 
}));

app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(setUser);

app.set("view engine", "hbs");
app.set("views", path.join(process.cwd(), "views"));
hbs.registerPartials(path.join(process.cwd(), "views/partials"));
hbs.registerHelper("eq", (a, b) => a === b);

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use("/auth", authRoutes);
app.use("/master", requireAuth, requireRole("master"), masterRoutes);
app.use("/admin", requireAuth, requireRole("admin"), adminRoutes);
app.use("/client", requireAuth, requireRole("client"), clientRoutes);
// app.use("/master", masterViewRoutes);


app.get('/', (req, res) => {
    res.render('index', { title: 'Main', layout: false});
});

// 1. Обробка 404 (коли сторінку не знайдено)
app.use((req, res, next) => {
    const err = new Error('Page not found');
    err.status = 404;
    next(err);
});

// 2. Глобальний обробник помилок (перехоплює ВСІ інші помилки)
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message); // Логуємо в консоль для себе

    const status = err.status || 500;
    const message = err.message || 'Something went wrong';

    // Якщо це AJAX-запит (наприклад, fetch з фронтенду, як при редагуванні)
    // повертаємо JSON, щоб фронтенд міг показати акуратний alert або повідомлення
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(status).json({ success: false, message: message });
    }

    // Якщо це звичайний перехід по сторінці - рендеримо наш кастомний шаблон
    res.status(status).render('error', {
        title: 'Error',
        message: message,
        status: status
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});