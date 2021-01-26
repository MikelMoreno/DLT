const{Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


const myKey = ec.keyFromPrivate('ef2e6b7aa0806ed7aaf33990ffa62790aa5822d5cbab35d187b5ad09bb164f91');
const myWalletAddress = myKey.getPublic('hex');



let morecoin = new Blockchain();


const tx1 = new Transaction(myWalletAddress, 'address2', 10);
tx1.signTransaction(myKey);
morecoin.addTransaction(tx1);

console.log('\n Starting the miner');
morecoin.minePendingTransactions(myWalletAddress);

console.log('\n Balance of mikel address', morecoin.getBalanceOfAdress(myWalletAddress));

console.log('\n is chain valid? ',morecoin.isChainValid());




function main() {
    let morecoin = new Blockchain();
    console.log('Creating some transactions....');
    morecoin.createTransaction(new Transaction('address1', 'address2' , 100));
    morecoin.createTransaction(new Transaction('address2', 'address1' , 50));
    
    console.log('\n Starting the miner');
    morecoin.minePendingTransactions('mikel-address');
    console.log('\n Balance of mikel address is', morecoin.getBalanceOfAdress('mikel-address'));
    
    
    console.log('\n Starting the miner again');
    morecoin.minePendingTransactions('mikel-address');
    console.log('\n Balance of mikel address is', morecoin.getBalanceOfAdress('mikel-address'));
}

//main();