# СТРУКТУРА:
      SERVICE-CENTER-APP/
      ├── config/
      │   └── db.js      # Налаштування підключення database, створення таблиць (users, orders)
      ├── controllers/
      │   ├── authController.js     # Реєстрація, вхід, вихід
      │   ├── clientController.js   # Створення замовлення, перегляд своїх замовлень
      │   ├── masterController.js   # Керування замовленнями, оновлення статусу, коментаря, ціни
      │   └── adminController.js    # Керування замовленнями, призначення майстрів, створення нових замовлень і майстрів
      ├── middleware/
      │   └── authMiddleware.js     # Перевірка: чи залогінений юзер? яка його роль (клієнт, майстер, адмін)?
      ├── models/             
      │   ├── index.js        
      │   ├── User.js        
      │   └── Order.js
      ├── public/
      │   ├── css/
      │       └── style.css
      ├── routes/
      │   ├── auth.js
      │   ├── client.js
      │   ├── master.js
      │   └── admin.js
      ├── views/              
      │   ├── partials/
      │   ├── auth/
      │   │    ├── login.hbs        
      │   │    └── register.hbs
      │   ├── client/
      │   │    ├── createClient.hbs          # Створення клієнтів 
      │   │    └── dashboardClient.hbs       # Перегляд замовлень клієнтом
      │   ├── master/
      │   │    ├── dashboardMaster.hbs       # Перегляд і керування своїми замовленнями
      │   │    ├── dashboardMaster.js        
      │   │    ├── editMaster.hbs            # Редаагування своїх замовлень 
      │   │    └── editMaster.js            
      │   ├── admin/
      │   │    ├── createMasterAdmin.hbs     # сторінка створення майстрів адміном
      │   │    ├── createOrderAdmin.hbs      # Створення замовлення 
      │   │    ├── dashboardAdmin.hbs        # Перегляд і керування усіма замовленнями
      │   │    ├── dashboardAdmin.js        
      │   │    └── editOrderAdmin.js         # Редагування усіх замовлень
      │   ├── error.hbs
      │   ├── index.hbs
      │   └── loyout.hbs
      ├── .env                 
      └── app.js                

# Специфікація маршрутів (API & Views)

## 1. Авторизація (Auth API)
*Базовий шлях: `/api/auth`*

| Метод | Шлях | Опис |
| :--- | :--- | :--- |
| **POST** | `/register` | Реєстрація нового користувача (роль за замовчуванням: `client`). |
| **POST** | `/login` | Вхід у систему. Дані зберігаються в сесії (`req.user`). |
| **POST** | `/logout` | Вихід із системи та очищення сесії. |

---

## 2. Панель Майстра (Master API)
*Доступ: `isMaster` (ролі: `master`, `admin`). Базовий шлях: `/api/master`*

| Метод | Шлях | Опис |
| :--- | :--- | :--- |
| **GET** | `/dashboard` | Повертає `newOrders` (статус `new`) та `myOrders` (закріплені за майстром). |
| **PUT** | `/order/:id` | Оновлення замовлення: зміна `status` та додавання `technician_comment`. |

---

## 3. Панель Адміністратора (Admin API)
*Доступ: `isAdmin` (роль: `admin`). Базовий шлях: `/api/admin`*

| Метод | Шлях | Опис |
| :--- | :--- | :--- |
| **GET** | `/all-info` | Отримання всіх замовлень та списку всіх майстрів для призначення. |
| **POST** | `/assign` | Призначення майстра на замовлення (змінює статус на `in progress`). |

---

## 4. Клієнтська частина (Client API)
*Доступ: Авторизовані користувачі. Базовий шлях: `/api/client`*

| Метод | Шлях | Опис |
| :--- | :--- | :--- |
| **GET** | `/orders` | Отримання списку замовлень лише поточного клієнта. |
| **POST** | `/create` | Створення нової заявки на ремонт. |

---

## Маршрути інтерфейсу (View Routes)
*Шляхи для відображення HTML-сторінок у браузері*

| Роль | Шлях | Файл сторінки |
| :--- | :--- | :--- |
| **Клієнт** | `/api/client` | `dashboardClient.js` |
| **Клієнт** | `/api/client/create` | `createClient.js` |
| **Майстер** | `/api/master` | `dashboardMaster.js` |
| **Майстер** | `/api/master/edit/:id` | `editMaster.js` |
| **Адмін** | `/api/admin/dashboard` | `dashboardAdmin.js` |

---

## Статуси замовлень (Order Statuses)
Для консистентності даних у БД використовуйте лише ці значення статусу:
* `new` — створено клієнтом.
* `in progress` — прийнято в роботу / призначено майстра.
* `waiting customer response` — очікує погодження з клієнтом.
* `waiting spare parts` — очікування запчастин.
* `failed` — ремонт неможливий.
* `done` — ремонт завершено.