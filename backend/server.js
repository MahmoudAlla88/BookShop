const express = require("express");
const cors = require("cors");
const pool=require('./db')
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/storybook",async(req,res)=>{
    try{
        const result=await pool.query("SELECT * FROM books WHERE is_deleted = false")
        res.json(result.rows)
    }
    catch (err) {
        res.status(500).json({ error: err.message });
      }
});
app.post("/newbook", async (req, res) => {
    try {
        const { title, author, genre, publish_data, description, cover_image } = req.body;
        const result = await pool.query(
            "INSERT INTO books (title, author, genre, publish_data, description, cover_image, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *",
            [title, author, genre, publish_data, description, cover_image]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// app.put("/editbook/:id",async (req,res)=>{
//     try {
//         const { id } = req.params;
//         const {title,author,genre,publish_data,description,cover_image}=req.body;
//         const result = await pool.query(
//             "UPDATE books SET title = $1,  author= $2, genre = $3 , publish_data=$4 , description=$5, cover_image=$6 WHERE id = $7 RETURNING *",
//             [title,author,genre,publish_data,description,cover_image, id]
       
//           );
//           res.json(result.rows[0]);
//         } catch (err) {
//           res.status(500).json({ error: err.message });
//         }
// });

app.patch("/editbook/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, genre, publish_data, description, cover_image } = req.body;

        // ✅ التحقق من أن جميع الحقول موجودة
        if (!title || !author || !genre || !publish_data || !description || !cover_image) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const result = await pool.query(
            "UPDATE books SET title = $1, author = $2, genre = $3, publish_data = $4, description = $5, cover_image = $6 WHERE id = $7 RETURNING *",
            [title, author, genre, publish_data, description, cover_image, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Book not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Database error:", err);  // ✅ طباعة الخطأ في السيرفر
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/deletebook/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("UPDATE books SET is_deleted = true WHERE id = $1", [id]);
      res.json({ message: "Employee deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });








const PORT = process.env.PORT || 5013;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));