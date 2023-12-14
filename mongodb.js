import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const PORT = 5100;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/myDatabase");

const dbSchema = new mongoose.Schema({
    _id: Number,
    name: String,
}, {collection: "user_data"});

const db = mongoose.model("user_data", dbSchema);

app.get("/all", async (req, res) => {
    try {
        const result = await db.find({}).exec();
        console.log(result);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/create', async (req, res) => { 
    try {
        const data = await db.find({}).exec();
        const lastId = data.slice(-1)
        const user = new db({ _id: lastId[0]._id + 1, name: req.body.name });
        await user.save()
        const result = await db.find({}).exec();
        res.json(result);
        res.status(200);
    } catch (error) {
        res.status(500)
    }
})

app.patch('/update/:id', async (req, res) => {
    try {
        await db.updateOne({ _id: req.params.id }, { $set: { name: req.body.name } });
        const result = await db.find({}).exec();
        res.json(result);
        res.status(200);
    } catch (error) {
        res.status(500)
    }
})

app.delete('/delete/:id', async (req, res) => {
    try {
        await db.deleteOne({ _id: req.params.id });
        const result = await db.find({}).exec();
        res.json(result);
        res.status(200);
    } catch (error) {
        res.status(500)
    }
})

app.listen(PORT, () => {
    console.log(`MongoDB REST API is running on port ${PORT}`);
});