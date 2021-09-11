let poems = [
  "violets are blue, I love you",
  "Carpe diem",
  "hasta la victoria que siempre!",
];
let blockchain = [];

function Block(textData, index, prevHash) {
  this.poem = textData;
  this.index = index;
  this.timestamp = Date.now();
  this.prevHash = prevHash;
  if (blockchain.length === 0) {
    this.hash = "000000";
  } else {
    this.hash = SHA256(this.poem + this.index + this.timestamp + prevHash);
  }
}

let genesisBlock = new Block(poems[0], 0, "somethingstupid");
poems = poems.filter((element) => element !== poems[0]);

// add block to blockchain
blockchain = [...blockchain, genesisBlock];

poems.map(function (poem, index) {
  let lastBlockAdded = blockchain[blockchain.length - 1];

  let a = new Block(poem, lastBlockAdded.index + 1, lastBlockAdded.hash);
  blockchain = [...blockchain, a];
});

function verifyChain() {
  blockchain.map(function (block) {
    verifyBlock(block);
  });
}

function hashCheck(block) {
  if (
    block.hash ===
    SHA256(block.poem + block.index + block.timestamp + block.prevHash)
  ) {
    return true;
  } else if (block.index == 0) {
    if (block.hash === "000000") {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
function verifyBlock(block) {
  if (
    block.index >= 0 &&
    block.poem != "" &&
    block.prevHash != "" &&
    hashCheck(block) === true
  ) {
    console.log("verified" + block.index);
  } else {
    console.log("fail" + block.index);
  }
}

verifyChain();
