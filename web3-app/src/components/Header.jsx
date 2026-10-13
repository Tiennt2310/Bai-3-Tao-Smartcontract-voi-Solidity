import { Link } from "react-router-dom";
import { MdLightMode } from "react-icons/md";
import { FaMoon } from "react-icons/fa";
import { useEffect, useState } from "react";
import { truncate, useGlobalState } from "../store";
import { connectWallet } from "../Blockchain.services";

const Header = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [connectedAccount] = useGlobalState("connectedAccount");

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  };

  return (
    <header className="sticky top-0 z-50">
      <nav className="flex w-full items-center justify-between bg-white px-6 py-3 shadow-md dark:bg-[#212936]">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://haitrieu.com/wp-content/uploads/2021/10/Logo-Hoc-Vien-Cong-Nghe-Buu-Chinh-Vien-Thong-PTITSimple-635x807.png"
            className="h-10 w-10 object-contain"
            alt="PTIT logo"
          />
          <span className="text-xl font-bold text-gray-900 dark:text-gray-200">
            PTIT Dominion
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="Đổi giao diện sáng/tối"
            onClick={toggleTheme}
            className="text-gray-700 dark:text-blue-400"
          >
            {theme === "dark" ? (
              <MdLightMode size={25} />
            ) : (
              <FaMoon size={23} />
            )}
          </button>

          {connectedAccount ? (
            <button
              type="button"
              title={connectedAccount}
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-medium uppercase text-white dark:border dark:border-blue-500 dark:bg-transparent dark:text-blue-400"
            >
              {truncate(connectedAccount, 4, 4, 11)}
            </button>
          ) : (
            <button
              type="button"
              onClick={connectWallet}
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-medium uppercase text-white hover:bg-blue-700"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
