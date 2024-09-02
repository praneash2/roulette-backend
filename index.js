import express from "express";
import cors from"cors";
import user from './routes/user.js';
import bet from'./routes/bet.js';
import spin from './routes/spin.js';
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const app=express();

const port = 3000;

app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.send('Hello aWorld!');
});

app.use('/auth',user);
app.use('/bet',bet);
app.use('/spin',spin);
// Start the server

let PORT=process.env.PORT||5000;

let URL=process.env.URL;

mongoose.connect(URL).then(app.listen(PORT,()=>{
    console.log(`connected to mongo and server started listening on ${PORT}`);})
).catch(()=>{
    console.log("cant connect to mongo");
});
