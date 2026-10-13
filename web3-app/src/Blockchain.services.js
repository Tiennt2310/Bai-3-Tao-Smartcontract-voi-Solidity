import Web3 from "web3";
import { setGlobalState, getGlobalState } from "./store";
import abi from "./abis/DominionDAO.json";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

const getWeb3 = () => {
  if (!window.ethereum) {
    throw new Error("Vui lòng cài đặt MetaMask.");
  }

  return new Web3(window.ethereum);
};

const ensureSepolia = async () => {
  const chainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (chainId !== SEPOLIA_CHAIN_ID) {
    throw new Error(
      "Vui lòng chuyển MetaMask sang mạng Sepolia."
    );
  }
};

const getEtheriumContract = async () => {
  const connectedAccount = getGlobalState("connectedAccount");

  if (!connectedAccount) {
    throw new Error("Vui lòng kết nối MetaMask trước.");
  }

  const web3 = getWeb3();
  const contractAddress =
    process.env.REACT_APP_CONTRACT_ADDRESS;

  if (!contractAddress || !Web3.utils.isAddress(contractAddress)) {
    throw new Error(
      "Địa chỉ contract trong file .env không hợp lệ."
    );
  }

  const contract = new web3.eth.Contract(
    abi.abi,
    contractAddress
  );

  setGlobalState("contract", contract);

  return contract;
};

// Kết nối ví MetaMask
const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("Vui lòng cài đặt MetaMask.");
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts.length) {
      throw new Error("Không tìm thấy tài khoản MetaMask.");
    }

    await ensureSepolia();

    setGlobalState(
      "connectedAccount",
      accounts[0].toLowerCase()
    );

    await getInfo();
    await getProposals();
  } catch (error) {
    reportError(error);
  }
};

// Kiểm tra ví đã kết nối hay chưa
let walletListenersRegistered = false;

const isWallectConnected = async () => {
  try {
    if (!window.ethereum) {
      console.warn("Chưa tìm thấy MetaMask.");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });

    if (accounts.length) {
      setGlobalState(
        "connectedAccount",
        accounts[0].toLowerCase()
      );

      if (!walletListenersRegistered) {
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", async (nextAccounts) => {
          if (nextAccounts.length) {
            setGlobalState(
              "connectedAccount",
              nextAccounts[0].toLowerCase()
            );

            try {
              await getInfo();
              await getProposals();
            } catch (error) {
              console.error("Lỗi cập nhật tài khoản:", error);
            }
          } else {
            setGlobalState("connectedAccount", "");
            setGlobalState("isStakeholder", false);
            setGlobalState("balance", 0);
            setGlobalState("mybalance", 0);
            setGlobalState("proposals", []);
          }
        });

        walletListenersRegistered = true;
      }
    } else {
      setGlobalState("connectedAccount", "");
      console.log("Chưa có tài khoản MetaMask được kết nối.");
    }
  } catch (error) {
    reportError(error);
  }
};

// Đóng góp ETH vào quỹ DAO
const performContribute = async (amount) => {
  try {
    await ensureSepolia();

    if (!amount || !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0) {
      throw new Error("Số ETH đóng góp phải lớn hơn 0.");
    }

    const web3 = getWeb3();
    const contract = await getEtheriumContract();
    const account = getGlobalState("connectedAccount");

    const value = web3.utils.toWei(
      amount.toString(),
      "ether"
    );

    const receipt = await contract.methods
      .contribute()
      .send({
        from: account,
        value,
      });

    await getInfo();
    await getProposals();

    return receipt;
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// Lấy thông tin DAO và Stakeholder
const getInfo = async () => {
  try {
    if (!window.ethereum) return;

    const connectedAccount =
      getGlobalState("connectedAccount");

    if (!connectedAccount) return;

    const web3 = getWeb3();
    const contract = await getEtheriumContract();

    const [isStakeholder, balance, mybalance] =
      await Promise.all([
        contract.methods
          .isStakeholder()
          .call({ from: connectedAccount }),

        contract.methods.daoBalance().call(),

        contract.methods
          .getBalance()
          .call({ from: connectedAccount }),
      ]);

    setGlobalState(
      "balance",
      web3.utils.fromWei(String(balance), "ether")
    );

    setGlobalState(
      "mybalance",
      web3.utils.fromWei(String(mybalance), "ether")
    );

    setGlobalState("isStakeholder", isStakeholder);
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// Tạo Proposal
const raiseProposal = async ({
  title,
  description,
  beneficiary,
  amount,
}) => {
  try {
    await ensureSepolia();

    if (!title || !description || !beneficiary || !amount) {
      throw new Error("Vui lòng nhập đầy đủ thông tin Proposal.");
    }

    if (!Web3.utils.isAddress(beneficiary)) {
      throw new Error("Địa chỉ ví nhận tiền không hợp lệ.");
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      throw new Error("Số ETH đề xuất phải lớn hơn 0.");
    }

    const web3 = getWeb3();
    const contract = await getEtheriumContract();
    const account = getGlobalState("connectedAccount");

    const amountWei = web3.utils.toWei(
      amount.toString(),
      "ether"
    );

    const receipt = await contract.methods
      .createProposal(
        title,
        description,
        beneficiary,
        amountWei
      )
      .send({ from: account });

    await getInfo();
    await getProposals();

    return receipt;
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// Chuyển dữ liệu Proposal sang dạng dễ dùng trong React
const structuredProposals = (proposals) => {
  const web3 = getWeb3();

  return proposals
    .map((proposal) => ({
      id: String(proposal.id),
      amount: web3.utils.fromWei(
        String(proposal.amount),
        "ether"
      ),
      title: proposal.title,
      description: proposal.description,
      paid: proposal.paid,
      passed: proposal.passed,
      proposer: proposal.proposer,
      upvotes: Number(proposal.upvotes),
      downvotes: Number(proposal.downvotes),
      beneficiary: proposal.beneficiary,
      executor: proposal.executor,
      duration: String(proposal.duration),
    }))
    .reverse();
};

// Tải danh sách Proposal
const getProposals = async () => {
  try {
    if (!window.ethereum) return;

    const contract = await getEtheriumContract();
    const proposals = await contract.methods
      .getProposals()
      .call();

    setGlobalState(
      "proposals",
      structuredProposals(proposals)
    );
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// Lấy một Proposal theo ID
const getProposal = async (id) => {
  const proposals = getGlobalState("proposals");

  return proposals.find(
    (proposal) => String(proposal.id) === String(id)
  );
};

// Bỏ phiếu ủng hộ hoặc phản đối
const voteOnProposal = async (proposalId, supported) => {
  try {
    await ensureSepolia();

    const contract = await getEtheriumContract();
    const account = getGlobalState("connectedAccount");

    const receipt = await contract.methods
      .performVote(proposalId, supported)
      .send({ from: account });

    await getInfo();
    await getProposals();

    return receipt;
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// Lấy danh sách những người đã bỏ phiếu
const listVoters = async (id) => {
  try {
    const contract = await getEtheriumContract();

    return await contract.methods
      .getVotesOf(id)
      .call();
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// Thanh toán cho người thụ hưởng sau khi Proposal hết hạn
const payoutBeneficiary = async (id) => {
  try {
    await ensureSepolia();

    const contract = await getEtheriumContract();
    const account = getGlobalState("connectedAccount");

    const receipt = await contract.methods
      .payBeneficiary(id)
      .send({ from: account });

    await getInfo();
    await getProposals();

    return receipt;
  } catch (error) {
    reportError(error);
    throw error;
  }
};

// Ghi log lỗi để tiện kiểm tra khi thực hành
const reportError = (error) => {
  console.error(
    "DominionDAO error:",
    error?.reason ||
      error?.data?.message ||
      error?.message ||
      error
  );
};

export {
  isWallectConnected,
  connectWallet,
  performContribute,
  getInfo,
  raiseProposal,
  getProposals,
  getProposal,
  voteOnProposal,
  listVoters,
  payoutBeneficiary,
};
