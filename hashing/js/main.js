let poems = [
  "violets are blue, I love you",
  "Carpe diem",
  "hasta la victoria que siempre!",
];

function Block(textData, index, prevHash, timestamp, hash) {
  this.poem = textData;
  this.index = index;
  this.timestamp = timestamp;
  this.prevHash = prevHash;
  this.hash = hash;
}

let blockchain = poems.map(function (poem, index, lastAddedBlock) {
  let currentTime = Date.now();
  let prevHash = index === 0 ? "gensisiblockprevhash" : lastAddedBlock.hash;
  let hash =
    index === 0
      ? "000000"
      : generateHash(poem + index + currentTime + lastAddedBlock.hash);

  lastAddedBlock = new Block(poem, index, prevHash, currentTime, hash);
  return lastAddedBlock;
});

function generateHash(poem, index, timestamp, prevHash) {
  SHA256(poem + index + timestamp + prevHash);
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
        block.poem + block.index + block.timestamp + block.prevHash
      ) ||
    (block.index === 0 && block.hash === "000000")
  );
}

function verifyBlock(block) {
  return (
    block.index >= 0 &&
    block.poem != "" &&
    block.prevHash != "" &&
    hashCheck(block)
  );
}

console.log(verifyChain());
