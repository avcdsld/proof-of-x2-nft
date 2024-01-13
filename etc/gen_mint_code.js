function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const mintCodes = [];
for (let i = 0; i < 200; i++) {
    const mintCode = generateRandomString(6);
    mintCodes.push(mintCode);
    console.log(mintCode);
}

// require ethers.js v6
const { solidityPackedKeccak256 } = require('ethers');
for (let i = 0; i < mintCodes.length; i++) {
    const mintCodeHash = solidityPackedKeccak256(["string"], [mintCodes[i]]);
    console.log(mintCodeHash);
}
