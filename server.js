const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const pool = require("./db");


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

const JWT_SECRET = "supersecretkey";

async function checkAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/index.html');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const [rows] = await pool.query(
            'SELECT id, status FROM users WHERE id = ?',
            [decoded.id]
        );

        const user = rows[0];

        if (user.status === 'blocked' || !rows.length) {
            res.clearCookie('token');
            return res.redirect('/index.html');
        }

        req.user = user;
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.redirect('/index.html');
    }
}


app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.json({ success: false, message: "Все поля обязательны" });

  const hashed = await bcrypt.hash(password, 10);

  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hashed],
    );

    res.json({
      success: true,
      message:
        "Пользователь зарегистрирован. Проверьте email для подтверждения",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.json({ success: false, message: "Email уже зарегистрирован" });
    }
    res.json({ success: false, message: "Ошибка регистрации" });
    console.log(err);
  }
  
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  if (!rows.length)
    return res.json({ success: false, message: "Неверный email или пароль" });

  const user = rows[0];
  if (user.status === "blocked")
    return res.json({ success: false, message: "Пользователь заблокирован" });
  if (user.status === "unverified")
    return res.json({
      success: false,
      message: "Пользователь не аутентифицирован",
    });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match)
    return res.json({ success: false, message: "Неверный email или пароль" });

  await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
    user.id,
  ]);

  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.cookie("token", token, { httpOnly: true });
  res.json({ success: true, message: "Успешный вход" });
});

app.get("/users", checkAuth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, last_login, status FROM users ORDER BY last_login DESC",
  );
  res.json(rows);
});

app.post("/users/block", checkAuth, async (req, res) => {
  const { ids } = req.body;
  await pool.query('UPDATE users SET status = "blocked" WHERE id IN (?)', [
    ids,
  ]);
  res.json({ success: true });
});

app.post("/users/unblock", checkAuth, async (req, res) => {
  const { ids } = req.body;
  await pool.query('UPDATE users SET status = "active" WHERE id IN (?)', [ids]);
  res.json({ success: true });
});

app.post("/users/delete", checkAuth, async (req, res) => {
  const { ids } = req.body;
  await pool.query("DELETE FROM users WHERE id IN (?)", [ids]);
  res.json({ success: true });
});

app.post("/users/verify", checkAuth, async (req, res) => {
  const { ids } = req.body;
  await pool.query('UPDATE users SET status = "active" WHERE id IN (?)', [ids]);
  res.json({ success: true });
});

app.post("/users/delete-unverified", checkAuth, async (req, res) => {
  await pool.query('DELETE FROM users WHERE status = "unverified"');
  res.json({ success: true });
});

app.post("/logout", checkAuth, (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

app.listen(3000, () => console.log("Server started on http://localhost:3000"));
