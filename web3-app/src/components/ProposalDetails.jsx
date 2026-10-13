import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { voteOnProposal } from "../Blockchain.services";
import { useGlobalState } from "../store";

const ProposalDetails = () => {
  const { id } = useParams();
  const [proposals] = useGlobalState("proposals");
  const [isStakeholder] = useGlobalState("isStakeholder");

  const proposal = useMemo(
    () => proposals.find((item) => String(item.id) === String(id)),
    [proposals, id]
  );

  const data = proposal
    ? [
        {
          name: "Votes",
          Acceptees: Number(proposal.upvotes),
          Rejectees: Number(proposal.downvotes),
        },
      ]
    : [];

  const expired =
    proposal &&
    Date.now() >= Number(proposal.duration) * 1000;

  const onVote = async (choice) => {
    if (!proposal) {
      toast.error("Không tìm thấy Proposal.");
      return;
    }

    if (!isStakeholder) {
      toast.warning("Chỉ Stakeholder mới được bỏ phiếu.");
      return;
    }

    if (expired) {
      toast.warning("Proposal đã hết thời gian bỏ phiếu.");
      return;
    }

    if (proposal.passed || proposal.paid) {
      toast.warning("Proposal không còn nhận phiếu bầu.");
      return;
    }

    try {
      await voteOnProposal(proposal.id, choice);
      toast.success(
        choice ? "Voted to accept successfully!" : "Voted to reject successfully!"
      );
    } catch (error) {
      console.error("Lỗi bỏ phiếu:", error);
      toast.error(
        error?.reason ||
        error?.data?.message ||
        error?.message ||
        "Giao dịch bỏ phiếu thất bại."
      );
    }
  };

  if (!proposal) {
    return (
      <section className="p-8">
        <h2 className="text-2xl font-semibold">
          Không tìm thấy Proposal
        </h2>
        <p className="mt-2">
          Quay lại trang chủ và tải danh sách Proposal.
        </p>
      </section>
    );
  }

  return (
    <section className="p-8">
      <h2 className="mb-5 text-3xl font-semibold">
        {proposal.title}
      </h2>

      <p>
        This proposal is to payout{" "}
        <strong>{proposal.amount} ETH</strong>, currently has{" "}
        <strong>
          {Number(proposal.upvotes) + Number(proposal.downvotes)} votes
        </strong>
        , and is{" "}
        <strong>{expired ? "Expired" : "Open"}</strong>.
      </p>

      <p className="mt-2">
        Beneficiary:{" "}
        <span className="break-all">{proposal.beneficiary}</span>
      </p>

      <hr className="my-6 border-gray-300 dark:border-gray-500" />

      <p>{proposal.description}</p>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Acceptees" fill="#2563eb" />
            <Bar dataKey="Rejectees" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {isStakeholder && (
          <>
            <button
              type="button"
              disabled={Boolean(expired) || proposal.passed || proposal.paid}
              className="rounded-full bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => onVote(true)}
            >
              Accept
            </button>

            <button
              type="button"
              disabled={Boolean(expired) || proposal.passed || proposal.paid}
              className="rounded-full bg-red-600 px-6 py-2.5 text-xs font-medium uppercase text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => onVote(false)}
            >
              Reject
            </button>
          </>
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Votes in favor: {proposal.upvotes} · Votes against: {proposal.downvotes}
      </p>
    </section>
  );
};

export default ProposalDetails;
