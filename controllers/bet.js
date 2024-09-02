import Bet from '../model/bet.js';
import {  validateTransactionSignature } from '../utils/sendSolana.js';
import TransactionModel from "../model/transaction.js";
export const BetResult = async (req, res) => {
    try {
        const body = req.body;
        const { UserName, amount, walletAddress, toWalletAddress,signature} = body;
        const adminWalletAddress = process.env.ADMIN_WALLETE_ADDRESS;
        
        if (UserName && amount && walletAddress && toWalletAddress && toWalletAddress === adminWalletAddress) {
            const result=await Bet.findOne({UserName});
            
            // let address=await validateTransactionSignature(signature);
            // if(!address || address!=walletAddress){
            //     res.status(400).json({"message":"signature not valid"});
            //     return; 
            // }
            if(result){
        
                const amt=Number(result.amount)+Number(amount);
                await Bet.updateOne({ UserName }, {amount:amt});
                res.status(200).json({"amount":amt,"message":"Bet placed successfully"});
                return; 
            }
            
            // const existingTransactions=await TransactionModel.find({fromAddress:walletAddress});
            // console.log(existingTransactions);
            const bet = await Bet.create({ UserName, amount, walletAddress });
            await bet.save();
            res.status(200).json({"amount":amount,"message":"Bet placed successfully"});
            
        } else {
            res.status(400).json("Send valid info");
        }
    } catch (error) {
        res.status(500).json("Internal Server error");
    }
};


export const getBetAmount = async (req, res) => {
    try {
        const {UserName}=req.params;
        const result=await Bet.findOne({UserName});
        if(!result){
            res.status(200).json({"coin":0}); 
            return; 
        }
        res.status(200).json({"coin":result});
    } catch (error) {
        res.status(500).json("Internal Server error");
    }
};
