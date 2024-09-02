import {
	Connection,
	PublicKey,
	SystemProgram,
	Transaction,
	Keypair,
	sendAndConfirmTransaction,
	LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { decode } from "base58-universal";
import TransactionModel from "../model/transaction.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
export const sendSolana = async (fromPubkey, sendTo, amount) => {
	try {
		const connection = new Connection(
			"https://solana-devnet.g.alchemy.com/v2/81CXWBI9avABQ-yl46bQVf1PvzRh8FU_",
			"confirmed"
		);

		const transaction = new Transaction().add(
			SystemProgram.transfer({
				fromPubkey: new PublicKey(fromPubkey),
				toPubkey: new PublicKey(sendTo),
				lamports: Number(amount) * 1000000000, // 0.001 SOL
			})
		);

		const privateKey = process.env.PRIVATE_KEY;

		const secretKey = decode(privateKey);
		const keypair = Keypair.fromSecretKey(secretKey);
		const signature = await sendAndConfirmTransaction(connection, transaction, [
			keypair,
		]);
		console.log(signature);
		console.log("Transaction confirmed with signature:", signature);
	} catch (error) {
		console.log("Transaction failed:", error);
	}
};

const extractSenderAndAmount = (transaction) => {
    const { meta, transaction: { message } } = transaction;

    if (!meta || !message) {
        throw new Error('Invalid transaction data');
    }

    const { accountKeys, instructions } = message;
    const preBalances = meta.preBalances;
    const postBalances = meta.postBalances;

    // Calculate balance changes for each account
    const balanceChanges = accountKeys.map((key, index) => ({
        publicKey: key.toBase58(),
        balanceChange: postBalances[index] - preBalances[index]
    }));

    // Find the sender (account with decreased balance)
    const sender = balanceChanges.find(change => change.balanceChange < 0);
    const amount = -sender.balanceChange; // Amount sent (positive value)

    return {
        sender: sender ? sender.publicKey : 'Sender not found',
        amount: amount || 0
    };
};

const getTransactions = async (publicKey,connection) => {
    const address = new PublicKey(publicKey);
    return await connection.getSignaturesForAddress(address);
};

const getTransactionDetails = async (signature,connection) => {
    return await connection.getTransaction(signature);
};

export const transactions = async (pb) => {
	return new Promise(async (resolve, reject) => {
		try {
			const publicKey = new PublicKey(pb);
			const connection = new Connection(
				"https://solana-devnet.g.alchemy.com/v2/81CXWBI9avABQ-yl46bQVf1PvzRh8FU_",
				"confirmed"
			);

			let amt;
			const signatures = await getTransactions(publicKey, connection);

			for (const { signature } of signatures) {
				const transactionDetails = await getTransactionDetails(signature, connection);
				const { sender, amount } = extractSenderAndAmount(transactionDetails);

				let signatureAlreadyExists = await TransactionModel.findOne({ signature: signature });

				if (!signatureAlreadyExists) {
					amt = Number(amount) / LAMPORTS_PER_SOL;
					const transac = await TransactionModel.create({ signature: signature, fromAddress: sender, amount: amt });
					await transac.save();
				}
			}

			resolve('Transactions processed successfully'); // Resolve the promise with a success message or any value you want

		} catch (error) {
			reject(error); // Reject the promise if there's an error
		}
	});
};


export const validateTransactionSignature = async (signature) => {
    const connection = new Connection(
		"https://solana-devnet.g.alchemy.com/v2/81CXWBI9avABQ-yl46bQVf1PvzRh8FU_",
		"confirmed"
	);
	
	return new Promise(resolve=>setTimeout(async()=>{
		const transactionDetails = await getTransactionDetails(signature, connection);
		// const {sender,amount}=extractSenderAndAmount(transactionDetails);
		resolve(sender);
	},0));
	

};