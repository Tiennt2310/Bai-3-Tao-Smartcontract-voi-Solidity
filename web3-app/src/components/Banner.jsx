import { useState } from "react";
import { useGlobalState, setGlobalState } from "../store";
import { toast } from "react-toastify";
import { performContribute } from "../Blockchain.services";

const Banner = () => {
  const [isStakeholder] = useGlobalState("isStakeholder");
  const [proposals] = useGlobalState("proposals");
  const [balance] = useGlobalState("balance");
  const [mybalance] = useGlobalState("mybalance");
  const [connectedAccount] = useGlobalState("connectedAccount");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const onPropose = () => {
    if (!isStakeholder) {
      toast.info("Bạn cần đóng góp đủ điều kiện để trở thành Stakeholder.");
      return;
    }

    setGlobalState("createModal", "scale-100");
  };

  const onContribute = async () => {
    if (!connectedAccount) {
      toast.warning("Hãy kết nối MetaMask trước.");
      return;
    }

    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      toast.warning("Nhập số SepoliaETH lớn hơn 0.");
      return;
    }

    try {
      setLoading(true);
      await performContribute(amount);
      toast.success("Contribution received");
      setAmount("");
    } catch (error) {
      toast.error(error?.message || "Giao dịch đóng góp thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const opened = () =>
    proposals.filter(
      (proposal) =>
        Date.now() < Number(proposal.duration) * 1000
    ).length;

  return (
    <section className="p-8">
      <h2 className="mb-5 text-3xl font-semibold">
        {opened()} Proposal{opened() === 1 ? "" : "s"} Currently Opened
      </h2>

      <p>
        Current DAO Balance: <strong>{balance} ETH</strong>
        <br />
        Your contributions: <strong>{mybalance} ETH</strong>
        {isStakeholder ? ", and you are now a stakeholder 😊" : ""}
      </p>

      <hr className="my-6 border-gray-300 dark:border-gray-500" />

      <p>
        {isStakeholder
          ? "You can now raise proposals on this platform 😆"
          : "Contribute at least 0.01 ETH cumulatively to become a stakeholder."}
      </p>

      <div className="mt-4 flex w-full flex-row items-center justify-start md:w-1/3">
        <input
          type="number"
          min="0.000001"
          step="0.001"
          className="block w-full rounded border border-gray-300 bg-transparent px-3 py-2 text-base shadow-md dark:border-gray-500"
          placeholder="e.g. 0.01 SepoliaETH"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          disabled={loading}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-full bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={onContribute}
          disabled={loading}
        >
          {loading ? "Processing..." : "Contribute"}
        </button>

        {isStakeholder && (
          <button
            type="button"
            className="rounded-full border border-blue-600 px-6 py-2.5 text-xs font-medium uppercase text-blue-600 hover:bg-blue-600 hover:text-white"
            onClick={onPropose}
          >
            Propose
          </button>
        )}
      </div>
    </section>
  );
};

export default Banner;
