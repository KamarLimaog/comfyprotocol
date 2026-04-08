import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ConfidentialLendingModule = buildModule("ConfidentialLendingModule", (m) => {
  const token = m.contract("ConfidentialERC20");
  const lending = m.contract("ConfidentialLending", [token]);
  return { token, lending };
});

export default ConfidentialLendingModule;
