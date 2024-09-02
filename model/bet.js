import mongoose from 'mongoose';

const BetSchema = new mongoose.Schema({
    UserName: String,
    amount: String,
    walletAddress: String,
});

const Bet = mongoose.model('Bet', BetSchema);

export default Bet;
