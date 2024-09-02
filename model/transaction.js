import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    signature:String,
    fromAddress:String,
    amount:String,
});

const TransactionModel = mongoose.model('TransactionModel', TransactionSchema);

export default TransactionModel;
