import { useEffect, useState } from "react";
import Identicon from "react-identicons";
import moment from "moment";
import { useParams } from "react-router-dom";
import { truncate } from "../store";
import { listVoters } from "../Blockchain.services";

const Voters = () => {
  const { id } = useParams();
  const [voters, setVoters] = useState([]);
  const [allVoters, setAllVoters] = useState([]);
  const [filter, setFilter] = useState("all");
  const [status, setStatus] = useState("Đang tải danh sách người bỏ phiếu...");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setStatus("Đang tải danh sách người bỏ phiếu...");

        const result = await listVoters(id);

        if (!active) return;

        const normalized = result || [];
        setAllVoters(normalized);
        setVoters(normalized);
        setStatus(
          normalized.length
            ? `Đã tải ${normalized.length} lượt bỏ phiếu.`
            : "Chưa có lượt bỏ phiếu nào."
        );
      } catch (error) {
        console.error("Lỗi tải người bỏ phiếu:", error);

        if (active) {
          setStatus("Không tải được danh sách. Kiểm tra Console.");
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [id]);

  const applyFilter = (selected) => {
    setFilter(selected);

    if (selected === "accepted") {
      setVoters(allVoters.filter((vote) => vote.choosen));
    } else if (selected === "rejected") {
      setVoters(allVoters.filter((vote) => !vote.choosen));
    } else {
      setVoters(allVoters);
    }
  };

  const buttonClass = (selected) =>
    `px-5 py-2.5 text-xs font-medium uppercase ${
      filter === selected
        ? "bg-blue-600 text-white"
        : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
    }`;

  return (
    <section className="flex flex-col p-8">
      <h2 className="mb-5 text-2xl font-semibold">
        Voters
      </h2>

      <div className="mb-5 flex flex-wrap justify-center">
        <button
          type="button"
          className={`${buttonClass("all")} rounded-l-full`}
          onClick={() => applyFilter("all")}
        >
          All
        </button>

        <button
          type="button"
          className={buttonClass("accepted")}
          onClick={() => applyFilter("accepted")}
        >
          Acceptees
        </button>

        <button
          type="button"
          className={`${buttonClass("rejected")} rounded-r-full`}
          onClick={() => applyFilter("rejected")}
        >
          Rejectees
        </button>
      </div>

      <p className="mb-3 text-sm text-gray-500">{status}</p>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b dark:border-gray-500">
            <tr>
              <th className="px-6 py-4 text-left text-sm">Voter</th>
              <th className="px-6 py-4 text-left text-sm">Voted</th>
              <th className="px-6 py-4 text-left text-sm">Vote</th>
            </tr>
          </thead>

          <tbody>
            {voters.map((voter, index) => (
              <tr
                key={`${voter.voter}-${index}`}
                className="border-b dark:border-gray-500"
              >
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Identicon
                      string={voter.voter.toLowerCase()}
                      size={28}
                    />
                    <span title={voter.voter}>
                      {truncate(voter.voter, 4, 4, 11)}
                    </span>
                  </div>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {moment(Number(voter.timestamp) * 1000).fromNow()}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {voter.choosen ? (
                    <span className="rounded-full border border-blue-600 px-4 py-2 text-blue-600">
                      Accepted
                    </span>
                  ) : (
                    <span className="rounded-full border border-red-600 px-4 py-2 text-red-600">
                      Rejected
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Voters;
