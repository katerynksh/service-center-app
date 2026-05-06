import express from "express";
import dotenv from "dotenv";
import hbs from "hbs";
import path from "path";
import session from "express-session";

import { setUser } from "./middleware/authMiddleware.js";

import authRoutes from "./routes/auth.js";
import masterRoutes from "./routes/master.js";
import adminRoutes from "./routes/admin.js";
import clientRoutes from "./routes/client.js";
// import masterViewRoutes from "./views/master/editMaster.js";

dotenv.config();
const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key', 
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24 
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
app.use("/master", masterRoutes);
app.use("/admin", adminRoutes);
app.use("/client", clientRoutes);
// app.use("/master", masterViewRoutes);


app.get('/', (req, res) => {
    res.redirect('/auth/login');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});