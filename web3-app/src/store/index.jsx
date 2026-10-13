import { createGlobalState } from "react-hooks-global-state";
import moment from "moment";

const { setGlobalState, useGlobalState, getGlobalState } =
  createGlobalState({
    createModal: "scale-0",
    connectedAccount: "",
    contract: null,
    proposals: [],
    isStakeholder: false,
    balance: 0,
    mybalance: 0,
  });

const truncate = (text, startChars, endChars, maxLength) => {
  if (!text) return "";

  if (text.length > maxLength) {
    let start = text.substring(0, startChars);
    const end = text.substring(text.length - endChars);

    while (start.length + end.length < maxLength) {
      start += ".";
    }

    return start + end;
  }

  return text;
};

const daysRemaining = (timestamp) => {
  const targetDate = moment(Number(`${timestamp}000`));
  const today = moment();
  const days = targetDate.diff(today, "days");

  return days === 1 ? "1 day" : `${days} days`;
};

export {
  truncate,
  setGlobalState,
  useGlobalState,
  getGlobalState,
  daysRemaining,
};
