
let Asignatura = artifacts.require("Asignatura");

module.exports = function(deployer) {
  deployer.deploy(Asignatura, "BCDA", "2019-2020");
};
