// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Roulette", (m) => {
  const keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
  const subscriptionId = BigInt("39351849102606195754956676745443342948184171342401553720406455542894914355997");

  const roulette = m.contract("Roulette", [keyHash, subscriptionId]);

  return { roulette };
});
