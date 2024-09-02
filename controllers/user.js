import User from '../model/users.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const privateKey = "mcea_website";

export const login = async (req, res) => {
    try {
        const { UserName, Password } = req.params;

        const alreadyUserExists = await User.findOne({ UserName });
        if (alreadyUserExists) {
            const passwordMatch = await bcrypt.compare(Password, alreadyUserExists.Password);

            if (passwordMatch) {
                const token = jwt.sign({ UserName }, privateKey, { expiresIn: '10d' });
                res.status(200).json({ message: "Login successful", data: { token } });
            } else {
                res.status(200).json({ message: "Password is wrong" });
            }
        } else {
            res.status(404).json("User not found");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json("Internal Server Error");
    }
};

export const signUp = async (req, res) => {
    try {
        const { UserName, Password } = req.body;
        const hashedPassword = await bcrypt.hash(Password, 12); // 12 is the strength of the salt

        const alreadyUserExists = await User.findOne({ UserName });
        if (alreadyUserExists) {
            res.status(404).json({ data: "User exists" });
        } else {
            console.log("Created a new user");
            const user = await User.create({ UserName, Password: hashedPassword });
            await user.save();

            const token = jwt.sign({ UserName }, privateKey, { expiresIn: '10d' });
            res.status(200).json({ message: "Signup successful",data: { token } });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json("Internal Server Error");
    }
};

export const changePassword = async (req, res) => {
    try {
        const { UserName, Password } = req.body;
        const hashedPassword = await bcrypt.hash(Password, 12); // 12 is the strength of the salt

        const user = await User.findOne({ UserName });
        if (user) {
            await User.updateOne({ UserName }, { Password: hashedPassword });
            res.status(200).json({ data: "Password changed" });
        } else {
            res.status(401).json({ message: "User does not exist" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json("Internal Server Error");
    }
};
