import express from "express";
import dotenv from "dotenv"
import bodyParser from "body-parser";
import cors from "cors"
import pg from "pg"

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
dotenv.config()

const db = new pg.Client({
    user: process.env.DB_POSTGRES_USER,
    password: process.env.DB_POSTGRES_PASS,
    host: process.env.DB_POSTGRES_HOST,
    database: process.env.DB_POSTGRES_DATABASE,
    port: process.env.DB_POSTGRES_PORT,
})

await db.connect()
console.log('connect')

app.get("/all", async (req, res) => {
    try {
        const { rows } = await db.query("SELECT * FROM user_data");
        res.json(rows);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/create", async (req, res) => {
    try {
        const { rows } = await db.query("INSERT INTO user_data (name) VALUES ($1)", [req.body.name]);
        res.json(rows);
    } catch (error) {
        console.error("Error creating data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.patch("/update/:id", async (req, res) => {
    try {
        const { rows } = await db.query("UPDATE user_data SET name = $1 WHERE id = $2", [req.body.name, req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/delete/:id", async (req, res) => {
    try {
        const { rows } = await db.query("DELETE FROM user_data WHERE id = $1", [req.params.id]);
        res.json(rows);
    } catch (error) {
        console.error("Error deleting data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




app.listen(5000, () => console.log('port has running on port 5000'))