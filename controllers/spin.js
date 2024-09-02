import Spin from '../model/spin.js';
import Bet from '../model/bet.js';
import { sendSolana } from '../utils/sendSolana.js';
let roulette_rewards;
export const SpinResult = async (req, res) => {
    try {
        const body = req.body;
        const { moves, UserName, amount, walletAddress, toWalletAddress } = body;
        const adminWalletAddress = process.env.ADMIN_WALLETE_ADDRESS;

        // TODO: evaluate based on bet type
        // console.log(UserName , amount,  walletAddress , toWalletAddress , toWalletAddress === adminWalletAddress);
        if (UserName && amount && walletAddress && toWalletAddress && toWalletAddress === adminWalletAddress) {
            let randomNumber = Math.floor(Math.random() * 36) + 1;
            console.log(randomNumber);
            // randomNumber=20;
            const usersBet = await Bet.findOne({UserName});
            
            if (!usersBet) {
                return res.status(404).json("User's bet does not exist");
            }
            if (usersBet.amount === 0 || amount>usersBet.amount) {
                return res.status(200).json("Add some crypto to bet");
            }
            roulette_rewards = {
                "STRAIGHT_UP": 20,
                "1ST_DOZEN": 15,
                "2ND_DOZEN": 15,
                "3RD_DOZEN": 15,
                "1_TO_18": 12,
                "19_TO_36": 12,
                "ODD": 10,
                "EVEN": 10,
                "BLACK": 10,
                "RED": 10,
                "0": 20,
                "00": 20,
                "1ST_COLUMN": 15,
                "2ND_COLUMN": 15,
                "3RD_COLUMN": 15,
                "SPLIT": 18,
                "CORNER": 16
            }
            for(let i=0;i<moves.length;i++){
                let move=moves[i];
                let payload=move?.payload;
                let moveType=move?.type;
                console.log(moveType);
                for(let j=0;j<payload.length;j++){
                    if(payload[j]==randomNumber){
                        let reward=10;
                        if(roulette_rewards[moveType]){
                            reward=roulette_rewards[moveType];
                        }
                        
                        
                        const amountWon=amount*reward;
                        sendSolana(adminWalletAddress,walletAddress,amountWon);
                        await Bet.updateOne({ UserName }, {amount:amountWon});
                        const spin = await Spin.create({ UserName,amount:amountWon,won:1,amountWon:amountWon,walletAddress });
                        await spin.save();
                        res.status(200).json({"value":randomNumber,"message":"you won"});
                        return ;
                    }
                }
            }
            // Uncomment and complete the following code as needed
            await Bet.updateOne({ UserName }, {amount:usersBet.amount-amount});
            const spin = await Spin.create({ UserName,amount:usersBet.amount-amount,won:0,amountWon:0,walletAddress });
            await spin.save();
            res.status(200).json({"value":randomNumber,"message":"you lost"});    
          
        } else {
            res.status(400).json({"message":"Send valid info"});
        }
    } catch (error) {
        res.status(500).json({"message":"Internal Server error"});
    }
};
