require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const app = express();
const server = http.createServer(app);

// ✅ Cấu hình Socket.IO để cho phép nhiều client từ các port khác nhau
const io = new Server(server, {
    cors: { 
        origin: 
        ["http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://150.95.113.55", 
        "http://www.150.95.113.55", 
        "https://150.95.113.55", 
        "https://www.150.95.113.55" 
        ], 
        credentials: true 
    },
});

// ✅ Cấu hình CORS cho phép nhiều client
app.use(cors({ 
    origin: 
        ["http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://150.95.113.55", 
        "http://www.150.95.113.55", 
        "https://150.95.113.55", 
        "https://www.150.95.113.55" 
        ], 
    credentials: true 
}));
app.use(express.json());
app.use(bodyParser.json());

// ✅ Kết nối MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "chess_db",
});

db.connect(err => {
    if (err) {
        console.error("❌ Lỗi kết nối MySQL:", err);
        process.exit(1);
    }
    console.log("✅ Kết nối MySQL thành công");
});

// ✅ Cấu hình session với MySQL Store
const sessionStore = new MySQLStore({}, db);

app.use(session({
    key: "session_cookie",
    secret: process.env.SESSION_SECRET || "strong_secret_key_here",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true, // Bắt buộc sử dụng HTTPS
        httpOnly: true, 
        sameSite: 'none', // Cho phép chia sẻ cookie giữa các trang
        maxAge: 24 * 60 * 60 * 1000 // Thời gian sống của phiên (24 giờ)
    }
}));

// ✅ Danh sách avatar mặc định
const avatars = [
    "/avatars/anh1.png", "/avatars/anh2.png", "/avatars/anh3.png",
    "/avatars/anh4.png", "/avatars/anh5.png", "/avatars/anh6.png", "/avatars/anh7.png", "/avatars/anh8.png"
];

// ✅ API Đăng ký
app.post("/register", async (req, res) => {
    try {
        const { username, phone, email, password, confirmPassword } = req.body;
        if (!username || !phone || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "❌ Vui lòng điền đầy đủ thông tin" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "❌ Mật khẩu không khớp" });
        }

        db.query("SELECT COUNT(*) AS count FROM users WHERE email = ? OR phone = ?", [email, phone], async (err, results) => {
            if (err) return res.status(500).json({ message: "❌ Lỗi kiểm tra tài khoản" });
            if (results[0].count > 0) {
                return res.status(400).json({ message: "❌ Email hoặc số điện thoại đã được sử dụng" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

            db.query("INSERT INTO users (username, phone, email, password, avatar) VALUES (?, ?, ?, ?, ?)",
                [username, phone, email, hashedPassword, randomAvatar], (err) => {
                    if (err) return res.status(500).json({ message: "❌ Lỗi khi đăng ký tài khoản" });

                    db.query("INSERT INTO login (email, password, avatar) VALUES (?, ?, ?)",
                        [email, hashedPassword, randomAvatar], (err) => {
                            if (err) return res.status(500).json({ message: "❌ Lỗi khi đăng ký vào bảng login" });

                            res.status(201).json({ message: "✅ Đăng ký thành công!" });
                        });
                });
        });
    } catch (error) {
        console.error("❌ Lỗi server:", error);
        res.status(500).json({ message: "❌ Lỗi máy chủ" });
    }
});

// ✅ API Đăng nhập
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "❌ Vui lòng nhập email và mật khẩu" });
        }

        db.query("SELECT users.username, users.avatar, login.password FROM users JOIN login ON users.email = login.email WHERE users.email = ?",
            [email], async (err, results) => {
                if (err) return res.status(500).json({ message: "❌ Lỗi máy chủ" });
                if (results.length === 0) {
                    return res.status(400).json({ message: "❌ Email không tồn tại" });
                }

                const user = results[0];
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return res.status(400).json({ message: "❌ Sai mật khẩu" });
                }

                req.session.user = { username: user.username, avatar: user.avatar };
                req.session.save();

                res.json({
                    message: "✅ Đăng nhập thành công!",
                    user: req.session.user
                });
            });
    } catch (error) {
        console.error("❌ Lỗi đăng nhập:", error);
        res.status(500).json({ message: "❌ Lỗi máy chủ" });
    }
});

// ✅ API lấy user từ session
app.get("/session-user", (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ message: "❌ Chưa đăng nhập" });
    }
});

// ✅ API Đăng xuất
app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: "❌ Lỗi khi đăng xuất" });
        res.json({ message: "✅ Đã đăng xuất" });
    });
});

// ✅ API lấy tin nhắn theo thứ tự cũ trước, mới sau
app.get("/messages", (req, res) => {
    db.query("SELECT username, avatar, message, created_at FROM messages ORDER BY created_at ASC", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ✅ API lấy danh sách tài khoản
app.get("/users", (req, res) => {
    db.query("SELECT username, avatar FROM users", (err, results) => {
        if (err) return res.status(500).json({ message: "❌ Lỗi lấy danh sách người dùng", error: err });
        res.json(results);
    });
});

// ✅ API gửi tin nhắn và lưu thời gian
app.post("/messages", (req, res) => {
    const { username, avatar, message } = req.body;
    const query = "INSERT INTO messages (username, avatar, message, created_at) VALUES (?, ?, ?, NOW())";

    db.query(query, [username, avatar, message], (err) => {
        if (err) return res.status(500).json(err);
        io.emit("newMessage", { username, avatar, message, created_at: new Date() });
        res.json({ success: true });
    });
});

// ✅ WebSocket chat real-time
io.on("connection", socket => {
    console.log(`📡 User connected: ${socket.id}`);

    socket.on("sendMessage", data => {
        const { username, avatar, message } = data;
        const query = "INSERT INTO messages (username, avatar, message, created_at) VALUES (?, ?, ?, NOW())";

        db.query(query, [username, avatar, message], err => {
            if (!err) io.emit("newMessage", { username, avatar, message, created_at: new Date() });
        });
    });

    socket.on("disconnect", () => console.log(`❌ User disconnected: ${socket.id}`));
});

// ✅ Kiểm tra port trước khi chạy
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});