"use strict";

var path = require("path");
var fs = require("fs");
var crypto = require("crypto");
var openpgp = require("openpgp");

const KEYS_DIR = path.join(__dirname, "keys");
const PRIV_KEY_TEXT = fs.readFileSync(
  path.join(KEYS_DIR, "priv.pgp.key"),
  "utf8"
);
const PUB_KEY_TEXT = fs.readFileSync(
  path.join(KEYS_DIR, "pub.pgp.key"),
  "utf8"
);

let poems = [
  "violets are blue, I lovssssssssse you",
  "Carpe diem",
  "hasta la victoria que siempre!",
];

function Block(textData, index, prevHash, timestamp, hash) {
  this.transaction = textData;
  this.index = index;
  this.timestamp = timestamp;
  this.prevHash = prevHash;
  this.hash = hash;
}

function generateHash(poem, index, timestamp, prevHash) {
  return crypto
    .createHash("sha256")
    .update(poem + index + timestamp + prevHash)
    .digest("hex");
}

function verifyChain() {
  return (
    blockchain
      .map(function (block) {
        return verifyBlock(block);
      })
      .filter((element) => element === false).length === 0
  );
}

function hashCheck(block) {
  return (
    block.hash ===
      generateHash(
        block.transaction + block.index + block.timestamp + block.prevHash
      ) ||
    (block.index === 0 && block.hash === "000000")
  );
}

function verifyBlock(block) {
  return (
    block.index >= 0 &&
    block.transaction != "" &&
    block.prevHash != "" &&
    hashCheck(block)
  );
}

function Transaction(data, hash) {
  this.data = data;
  this.hash = hash;
  this.pubKey = "";
  this.signature = "";
}
function createTransaction(poem) {
  return new Transaction(poem, transactionHash(poem));
}

function transactionHash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

async function authorizeTransaction(transaction) {
  transaction.pubKey = PUB_KEY_TEXT;
  transaction.signature = await createSignature(
    transaction.hash,
    PRIV_KEY_TEXT
  );
  return transaction;
}

async function createSignature(text, privKey) {
  var privKeyObj = openpgp.key.readArmored(privKey).keys[0];

  var options = {
    data: text,
    privateKeys: [privKeyObj],
  };

  return (await openpgp.sign(options)).data;
}

let blockchain = [];
blockchain = [
  ...blockchain,
  new Block("0", 0, "prevhash", Date.now(), "000000"),
];

async function getBlockChain() {
  const transactions = await Promise.all(
    poems.map(async (poem) => {
      return authorizeTransaction(createTransaction(poem));
    })
  );
  let lastAddedBlock = blockchain[blockchain.length - 1];

  // [...blockchain, new Block()];
  let currentTime = Date.now();

  blockchain = [
    ...blockchain,
    new Block(
      transactions,
      lastAddedBlock.index + 1,
      lastAddedBlock.hash,
      currentTime,
      generateHash(
        transactions +
          (lastAddedBlock.index + 1) +
          currentTime +
          lastAddedBlock.hash
      )
    ),
  ];

  console.log(verifyChain);
}
getBlockChain();
