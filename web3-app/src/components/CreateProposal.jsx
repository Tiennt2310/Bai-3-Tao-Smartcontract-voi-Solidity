import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { setGlobalState, useGlobalState } from "../store";
import { raiseProposal } from "../Blockchain.services";
import { toast } from "react-toastify";

const CreateProposal = () => {
  const [createModal] = useGlobalState("createModal");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setBeneficiary("");
    setDescription("");
  };

  const closeModal = () => {
    setGlobalState("createModal", "scale-0");
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim() || !description.trim() ||
        !beneficiary.trim() || !amount.trim()) {
      toast.warning("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      setLoading(true);

      await raiseProposal({
        title: title.trim(),
        description: description.trim(),
        beneficiary: beneficiary.trim(),
        amount,
      });

      toast.success("Proposal created successfully!");
      closeModal();
    } catch (error) {
      toast.error(error?.message || "Tạo Proposal thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50 p-4 transition-transform duration-300 ${
        createModal === "scale-100" ? "scale-100" : "scale-0"
      }`}
    >
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-[#212936] md:w-2/5">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Raise Proposal</p>
            <button
              type="button"
              onClick={closeModal}
              className="border-0 bg-transparent"
              aria-label="Đóng"
            >
              <FaTimes />
            </button>
          </div>

          <input
            className="mt-5 rounded-xl border border-gray-500 bg-transparent text-sm"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={loading}
            required
          />

          <input
            className="mt-5 rounded-xl border border-gray-500 bg-transparent text-sm"
            type="number"
            min="0.000001"
            step="0.001"
            placeholder="Amount in ETH, e.g. 0.005"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={loading}
            required
          />

          <input
            className="mt-5 rounded-xl border border-gray-500 bg-transparent text-sm"
            type="text"
            placeholder="Beneficiary Address (0x...)"
            value={beneficiary}
            onChange={(event) => setBeneficiary(event.target.value)}
            disabled={loading}
            required
          />

          <textarea
            className="mt-5 h-24 resize-none rounded-xl border border-gray-500 bg-transparent text-sm"
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={loading}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-5 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Proposal"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProposal;
