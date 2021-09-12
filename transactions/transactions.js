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

let blockchain;
async function getBlockChain() {
  const transactions = await Promise.all(
    poems.map(async (poem) => {
      return authorizeTransaction(createTransaction(poem));
    })
  );
  let lastAddedBlock;
  blockchain = transactions.map(function (transaction, index) {
    let currentTime = Date.now();
    let prevHash = index === 0 ? "gensisiblockprevhash" : lastAddedBlock.hash;
    let hash =
      index === 0
        ? "000000"
        : generateHash(
            transaction.data + index + currentTime + lastAddedBlock.hash
          );

    lastAddedBlock = new Block(transaction, index, prevHash, currentTime, hash);
    return lastAddedBlock;
  });
}

getBlockChain();
