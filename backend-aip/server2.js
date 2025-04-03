const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Specify allowed headers
    credentials: true  // Allow cookies to be sent
}));
app.use(express.json({ limit: '5mb' })); // Increased limit for larger JSON payloads
app.use('/uploads', express.static('uploads'));

// MySQL connection
const db = mysql.createConnection("mysql://root:newpassword@localhost:3306/chess_db");

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL");

        // Create chess_games table if it doesn't exist
        const createChessTableQuery = `
            CREATE TABLE IF NOT EXISTS chess_games (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                board_state JSON NOT NULL,
                current_turn VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                difficulty_rating TINYINT NOT NULL CHECK (difficulty_rating BETWEEN 1 AND 10)
            )
        `;

        db.query(createChessTableQuery, (err, result) => {
            if (err) {
                console.error("Error creating chess_games table:", err);
            } else {
                console.log("chess_games table checked/created successfully");
            }
        });

        // Create courses table if it doesn't exist
        const createCoursesTableQuery = `
            CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                image1 VARCHAR(255),
                image2 VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        db.query(createCoursesTableQuery, (err, result) => {
            if (err) {
                console.error("Error creating courses table:", err);
            } else {
                console.log("courses table checked/created successfully");
            }
        });

        // Create course_uploads table if it doesn't exist
        const createUploadsTableQuery = `
            CREATE TABLE IF NOT EXISTS course_uploads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                file VARCHAR(255) NOT NULL,
                note TEXT,
                type VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        `;

        db.query(createUploadsTableQuery, (err, result) => {
            if (err) {
                console.error("Error creating course_uploads table:", err);
            } else {
                console.log("course_uploads table checked/created successfully");
            }
        });
    }
});

// Cấu hình multer để upload ảnh & video
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// =============== CHESS GAME APIs ===============

// API: Save a new game state
app.post('/save-game', (req, res) => {
    const { name, board_state, current_turn, difficulty_rating } = req.body;

    if (!difficulty_rating || difficulty_rating < 1 || difficulty_rating > 10) {
        return res.status(400).json({ error: "Difficulty rating must be between 1 and 10" });
    }

    // Convert board_state to string if it's not already
    const boardStateJSON = typeof board_state === 'string'
        ? board_state
        : JSON.stringify(board_state);

    const sql = "INSERT INTO chess_games (name, board_state, current_turn, difficulty_rating) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, boardStateJSON, current_turn, difficulty_rating], (err, result) => {
        if (err) {
            console.error("Error saving game:", err);
            return res.status(500).json({ error: "Failed to save game" });
        }
        res.json({
            message: "Game saved successfully!",
            gameId: result.insertId
        });
    });
});

// API: Get a list of saved games with difficulty ratings
app.get('/games', (req, res) => {
    db.query(
        "SELECT id, name, difficulty_rating, created_at FROM chess_games ORDER BY created_at DESC",
        (err, result) => {
            if (err) {
                console.error("Error fetching games:", err);
                return res.status(500).json({ error: "Failed to fetch games" });
            }
            res.json(result);
        }
    );
});

// API: Get a specific game by ID
app.get('/game/:id', (req, res) => {
    const gameId = req.params.id;

    db.query(
        "SELECT * FROM chess_games WHERE id = ?",
        [gameId],
        (err, result) => {
            if (err) {
                console.error("Error fetching game:", err);
                return res.status(500).json({ error: "Failed to fetch game" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "Game not found" });
            }

            res.json(result[0]);
        }
    );
});

// API: Delete a game
app.delete('/game/:id', (req, res) => {
    const gameId = req.params.id;

    db.query(
        "DELETE FROM chess_games WHERE id = ?",
        [gameId],
        (err, result) => {
            if (err) {
                console.error("Error deleting game:", err);
                return res.status(500).json({ error: "Failed to delete game" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Game not found" });
            }

            res.json({ message: "Game deleted successfully" });
        }
    );
});

// =============== COURSE APIs ===============

// API: Thêm khóa học
app.post('/courses', upload.fields([{ name: 'image1' }, { name: 'image2' }]), (req, res) => {
    const { name, description } = req.body;
    const image1 = req.files['image1'] ? req.files['image1'][0].filename : null;
    const image2 = req.files['image2'] ? req.files['image2'][0].filename : null;

    const sql = "INSERT INTO courses (name, description, image1, image2) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, description, image1, image2], (err, result) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json({ message: 'Khóa học đã được thêm!', id: result.insertId });
        }
    });
});

// API: Lấy danh sách khóa học
app.get('/courses', (req, res) => {
    db.query("SELECT * FROM courses", (err, results) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json(results);
        }
    });
});

// API: Xóa khóa học
app.delete('/courses/:id', (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM courses WHERE id = ?", [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json({ message: 'Khóa học đã được xóa!' });
        }
    });
});

// API: Cập nhật khóa học
app.put('/courses/:id', upload.fields([{ name: 'image1' }, { name: 'image2' }]), (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    let image1 = req.files['image1'] ? req.files['image1'][0].filename : null;
    let image2 = req.files['image2'] ? req.files['image2'][0].filename : null;

    db.query("SELECT image1, image2 FROM courses WHERE id = ?", [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (!image1) image1 = results[0].image1;
        if (!image2) image2 = results[0].image2;

        const sql = "UPDATE courses SET name=?, description=?, image1=?, image2=? WHERE id=?";
        db.query(sql, [name, description, image1, image2, id], (err, result) => {
            if (err) {
                res.status(500).json({ error: err });
            } else {
                res.json({ message: 'Khóa học đã được cập nhật!' });
            }
        });
    });
});

// API: Upload video/ảnh + ghi chú
app.post('/uploads', upload.single('file'), (req, res) => {
    const { courseId, note } = req.body;
    const file = req.file ? req.file.filename : null;
    const fileType = req.file.mimetype.includes('video') ? 'video' : 'image';

    if (!file) {
        return res.status(400).json({ error: "File không hợp lệ!" });
    }

    const sql = "INSERT INTO course_uploads (course_id, file, note, type) VALUES (?, ?, ?, ?)";
    db.query(sql, [courseId, file, note, fileType], (err, result) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json({ message: 'Tải lên thành công!', id: result.insertId });
        }
    });
});

// API: Lấy danh sách video/ảnh + ghi chú của khóa học
app.get('/uploads', (req, res) => {
    const { courseId } = req.query;
    const sql = "SELECT * FROM course_uploads WHERE course_id = ?";
    db.query(sql, [courseId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json(results);
        }
    });
});

// API: Cập nhật ghi chú video/ảnh
app.put('/uploads/:id', (req, res) => {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
        return res.status(400).json({ error: "Ghi chú không được để trống!" });
    }

    const sql = "UPDATE course_uploads SET note = ? WHERE id = ?";
    db.query(sql, [note, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.json({ message: 'Cập nhật ghi chú thành công!' });
        }
    });
});

// API: Xóa video/ảnh
app.delete('/uploads/:id', (req, res) => {
    const { id } = req.params;

    // Lấy thông tin file trước khi xóa
    const getFileSql = "SELECT file FROM course_uploads WHERE id = ?";
    db.query(getFileSql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ error: "Không tìm thấy file!" });

        const filePath = path.join(__dirname, "uploads", results[0].file);

        // Xóa file vật lý nếu tồn tại
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Xóa dữ liệu trong database
        const deleteSql = "DELETE FROM course_uploads WHERE id = ?";
        db.query(deleteSql, [id], (err, result) => {
            if (err) {
                res.status(500).json({ error: err });
            } else {
                res.json({ message: 'Xóa video/ảnh thành công!' });
            }
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại http://150.95.111.7:${PORT}`));
