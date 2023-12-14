import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const prisma = new PrismaClient()


const accesValidation = (req, res, next) => {
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({message:'token diperlukan'})
    }

    const token = authorization.split(' ')[1]
    const secret = process.env.SECRET_JWT
    console.log(token)

    try {
        const jwtCode = jwt.verify(token, secret, { algorithms: ['HS256'] })
        req.user = jwtCode
        next()
        console.log(jwtCode)
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ message: "Token kedaluwarsa" });
        } else {
            res.status(401).json({ message: "Token tidak valid" });
        }
    }
}

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            },
        });
        res.redirect('/users')
    } catch (error) {
        if (error.meta.target == "email") {
            res.json({message: 'email has already'})
        } else {
            res.json(error.message)
        }
    }
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({where: {email}})

        const comaparedPassword = await bcrypt.compare(password, user.password);
        const token = jwt.sign(user , process.env.SECRET_JWT, { expiresIn: '1h' })
 
        if (comaparedPassword) {
            res.json({ user, token })
        } else {
            res.json({message: 'password does not match'})
        }
    } catch (error) {
        res.json({message: 'email does not exist'})
    }
})

app.post("/users", accesValidation, async (req, res) => {
    const { uid, email } = req.body;

    try {
        const data = await prisma.favanime.create({
            data: {
                mal_id: parseInt(uid),
                user_email: email,
            },
        });

        res.json({data, message: "succes to add anime",});
    } catch (error) {
        res.json({message: error.message,});
    }
});

app.get("/users", accesValidation, async (req, res) => {
    try {
        const data = await prisma.favanime.findMany();
        res.json(data);
    } catch (error) {
        res.json({
            message: "error to get anime",
        });
    }
});

app.patch("/users/:id", async (req, res) => {
    const { id } = req.params
    const { uid, email } = req.body;

    try {
        const data = await prisma.favanime.update({
            data: {
                mal_id: parseInt(uid),
                user_email: email,
            },
            where: {
                id: parseInt(id)
            }
        });
        res.json({
            data,
            message: "succes to update anime",
        });
    } catch (error) {
        res.json({
            message: error.message,
        });
    }
});

app.delete("/users/:id", async (req, res) => {
    const { id } = req.params
    const { uid, email } = req.body;

    try {
        const data = await prisma.favanime.delete({
            where: {
                id: parseInt(id)
            }
        });
        res.json({message: 'succes delete anime'});
    } catch (error) {
        res.json({
            message: error.message,
        });
    }
});


app.listen(5200, () => console.log("port has running on port 5200"));
