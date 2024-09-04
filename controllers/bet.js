import Bet from "../model/bet.js";
import { validateTransactionSignature } from "../utils/sendSolana.js";

const validateTransaction = async (signature, walletAddress,amountSent) => {
	let {address,amount} = await validateTransactionSignature(signature);
	console.log(address,Math.floor(amount),amountSent)
	if (!address || (address != walletAddress ) ) {
		return false;
	} else {
		return true;
	}
};

export const BetResult = async (req, res) => {
	try {
		const body = req.query;
		const { UserName, amount, walletAddress, toWalletAddress, signature } =
			body;
		const adminWalletAddress = process.env.ADMIN_WALLETE_ADDRESS;

		if (
			UserName &&
			amount &&
			walletAddress &&
			toWalletAddress &&
			toWalletAddress === adminWalletAddress
		) {
			const result = await Bet.findOne({ UserName });

			res.setHeader("Content-Type", "text/event-stream");
			const delay = 10000;

			// setTimeout(()=>{console.log(amount)},5000);
			if (result) {
				let value = JSON.stringify({
					amount: "-1",
					message: "waiting for confirmation",
				});
				res.write(`data: ${value}\n\n`);
				setTimeout(async () => {
					const amt = Number(result.amount) + Number(amount);

					const transactionResult = await validateTransaction(
						signature,
						walletAddress,
						amount
					);
					if (transactionResult == true) {
						await Bet.updateOne({ UserName }, { amount: amt });
						value = JSON.stringify({ amount: amt, message: "bet received" });
					} else {
						value = JSON.stringify({
							amount: amt,
							message: "bet not received",
						});
					}

					res.write(`data: ${value}\n\n`);
					res.end();
				}, delay);

				// res.status(200).json({"amount":amt,"message":"Bet placed successfully"});\

				return;
			}

			// const existingTransactions=await TransactionModel.find({fromAddress:walletAddress});
			// console.log(existingTransactions);
			let value = JSON.stringify({
				amount: -1,
				message: "waiting for confirmation",
			});
			res.write(`data: ${value}\n\n`);
			setTimeout(async () => {
				const transactionResult = await validateTransaction(
					signature,
					walletAddress,
					amount
				);
				if (transactionResult == true) {
					const bet = await Bet.create({ UserName, amount, walletAddress });
					await bet.save();
					value = JSON.stringify({ amount: amount, message: "bet received" });
				} else {
					value = JSON.stringify({
						amount: amount,
						message: "bet not received",
					});
				}

				res.write(`data: ${value}\n\n`);
				res.end();
			}, delay);

			// res.status(200).json({"amount":amount,"message":"Bet placed successfully"});
		} else {
			res.status(400).json("Send valid info");
		}
	} catch (error) {
		res.status(500).json("Internal Server error");
	}
};

export const getBetAmount = async (req, res) => {
	try {
		const { UserName } = req.params;
		const result = await Bet.findOne({ UserName });
		if (!result) {
			res.status(200).json({ coin: 0 });
			return;
		}
		res.status(200).json({ coin: result });
	} catch (error) {
		res.status(500).json("Internal Server error");
	}
};
