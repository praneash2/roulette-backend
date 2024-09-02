import mongoose from 'mongoose';

const SpinSchema = new mongoose.Schema({
    UserName: String,
    amount: String,
    won: Boolean,
    amountWon: String,
    walletAddress: String,
});

const Spin = mongoose.model('Spin', SpinSchema);

export default Spin;
