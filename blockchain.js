const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
    constructor(fromAdress, toAdress, amount){
        this.fromAdress = fromAdress;
        this.toAdress = toAdress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAdress + this.toAdress + this.amount).toString(); //modificado
    }
    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAdress){
            throw new Error('You cannot sign transactions for other wallets!');
        }
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, "base64");
        this.signature = sig.toDER('hex');
        
    }
    isValid(){
        if(this.fromAdress === null) return true;
        if(!this.signature || this.signature.length === 0){
            throw new Error("'No signature in this transaction");
        }
        const publicKey = ec.keyFromPublic(this.fromAdress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}
class Block {
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash =this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }
    //forzar la dificultad de la red 
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty +1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
            
        }
        console.log("Block Mined: " + this.hash);
    }
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }    
}

class Blockchain {
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendinTransactions = [];
        this.miningReward = 100;
    }
    createGenesisBlock(){
        return new Block(0,"20/11/2020","genesis Block", "0");
    }
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }
    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }
    createTransaction(transaction){
        this.pendinTransactions.push(transaction);
    }
    addTransaction(transaction){
        if(!transaction.fromAdress || !transaction.toAdress){
            throw new Error('Transaction must include from and to address');
        }
    
        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain');
        }
    
        this.pendinTransactions.push(transaction);
    }
    minePendingTransactions(miningRewardAdress){
        const rewards = new Transaction(null, miningRewardAdress, this.miningReward);
        this.pendinTransactions.push(rewards);
        
        let block = new Block(Date.now(), this.pendinTransactions);
        block.previousHash = this.getLatestBlock().hash;
        block.mineBlock(this.difficulty);
        console.log("Block Succesfully mined!")
        this.chain.push(block);
        this.pendinTransactions = [];
    }

    getBalanceOfAdress(address){
        let balance = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if(trans.fromAdress === address)
                //quitamos la cantidad del origen
                    balance-= trans.amount;
                if(trans.toAdress === address){
                    //añadimos la cantidad al destino
                    balance += trans.amount;
                }   
            }
        }
        return balance;
    }

    isChainValid(){
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
            if (!currentBlock.hasValidTransactions()) {
                return false;
            }
    
        }
        return true;
    }
}
module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;