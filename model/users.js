import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    UserName: String,
    Password: String,
});

const User = mongoose.model('User', UserSchema);

export default User;
