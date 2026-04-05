//перевірка:
//isClient
export const isClient = (req, res, next) => {
// Доступ дозволено, якщо роль 'client' або 'admin' (адмін зазвичай бачить все)
    if (req.user && req.user.role === 'client') {
        return next();
    }
    return res.status(403).render('error', { message: "Access denied: You are not a customer" });
};
//перевірка:
//isAdmin
//isMaster
export const isMaster = (req, res, next) => {
    // Доступ дозволено, якщо роль користувача 'master' або 'admin'
    if (req.user && (req.user.role === 'master' || req.user.role === 'admin')) {
        return next();
    }
    return res.status(403).json({ message: "Access denied: you are not a master" });
};
//перевірка:
//isAdmin
export const isAdmin = (req, res, next) => {
    // Доступ дозволено лише для ролі 'admin'
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: "Access denied: you are not an admin" });
};

const authMiddleware = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Access denied: you are not authenticated" });
    next();
};

export default authMiddleware;