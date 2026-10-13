import { useEffect, useState } from "react";
import Identicon from "react-identicons";
import { Link } from "react-router-dom";
import {
  truncate,
  useGlobalState,
  daysRemaining,
} from "../store";
import { payoutBeneficiary } from "../Blockchain.services";
import { toast } from "react-toastify";

const Proposals = () => {
  const [data] = useGlobalState("proposals");
  const [proposals, setProposals] = useState(data);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    setProposals(data);
  }, [data]);

  const isExpired = (proposal) =>
    Date.now() >= Number(proposal.duration) * 1000;

  const getAll = () => setProposals(data);

  const getOpened = () =>
    setProposals(data.filter((proposal) => !isExpired(proposal)));

  const getClosed = () =>
    setProposals(data.filter((proposal) => isExpired(proposal)));

  const handlePayout = async (proposal) => {
    if (!isExpired(proposal)) {
      toast.warning("Proposal chưa hết thời hạn bỏ phiếu.");
      return;
    }

    if (proposal.paid) {
      toast.info("Proposal này đã được thanh toán.");
      return;
    }

    if (Number(proposal.upvotes) <= Number(proposal.downvotes)) {
      toast.warning("Proposal chưa đủ phiếu ủng hộ để thanh toán.");
      return;
    }

    try {
      setLoadingId(String(proposal.id));

      await payoutBeneficiary(proposal.id);

      toast.success("Beneficiary successfully paid out!");

      // Dữ liệu Proposal sẽ được cập nhật từ blockchain
    } catch (error) {
      console.error("Lỗi thanh toán:", error);

      toast.error(
        error?.reason ||
        error?.data?.message ||
        error?.message ||
        "Thanh toán thất bại. Kiểm tra Console."
      );
    } finally {
      setLoadingId(null);
    }
  };

  const buttonBase =
    "px-6 py-2.5 text-xs font-medium uppercase transition";

  return (
    <section className="flex flex-col p-8">
      <h2 className="mb-5 text-2xl font-semibold">
        Proposals
      </h2>

      <div className="mb-6 flex flex-wrap justify-center">
        <button
          type="button"
          className={`${buttonBase} rounded-l-full bg-blue-600 text-white`}
          onClick={getAll}
        >
          All
        </button>

        <button
          type="button"
          className={`${buttonBase} border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white`}
          onClick={getOpened}
        >
          Open
        </button>

        <button
          type="button"
          className={`${buttonBase} rounded-r-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white`}
          onClick={getClosed}
        >
          Closed
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="overflow-y-auto rounded-md shadow-md">
            <table className="min-w-full">
              <thead className="border-b dark:border-gray-500">
                <tr>
                  <th className="px-6 py-4 text-left text-sm">
                    Created By
                  </th>
                  <th className="px-6 py-4 text-left text-sm">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm">
                    Expires
                  </th>
                  <th className="px-6 py-4 text-left text-sm">
                    Votes
                  </th>
                  <th className="px-6 py-4 text-left text-sm">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {proposals.map((proposal) => {
                  const expired = isExpired(proposal);
                  const id = String(proposal.id);

                  return (
                    <tr
                      key={id}
                      className="border-b dark:border-gray-500"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <Identicon
                            string={proposal.proposer.toLowerCase()}
                            size={28}
                          />
                          <span>
                            {truncate(
                              proposal.proposer,
                              4,
                              4,
                              11
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="max-w-xs px-6 py-4 text-sm">
                        {proposal.title}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {expired
                          ? "Expired"
                          : daysRemaining(proposal.duration)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className="text-blue-600">
                          {proposal.upvotes}
                        </span>
                        {" / "}
                        <span className="text-red-600">
                          {proposal.downvotes}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/proposal/${id}`}
                            className="rounded-full bg-blue-600 px-5 py-2 text-xs font-medium uppercase text-white hover:bg-blue-700"
                          >
                            View
                          </Link>

                          {expired &&
                            Number(proposal.upvotes) >
                              Number(proposal.downvotes) && (
                              proposal.paid ? (
                                <span className="rounded-full border border-green-600 px-4 py-2 text-xs text-green-600">
                                  Paid
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={loadingId === id}
                                  onClick={() => handlePayout(proposal)}
                                  className="rounded-full bg-red-600 px-5 py-2 text-xs font-medium uppercase text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                  {loadingId === id
                                    ? "Processing..."
                                    : "Payout"}
                                </button>
                              )
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {proposals.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No proposals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Proposals;
