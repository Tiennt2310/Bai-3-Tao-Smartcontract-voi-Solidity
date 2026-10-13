import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getInfo,
  getProposals,
  isWallectConnected,
} from "./Blockchain.services";

import { getGlobalState } from "./store";
import Header from "./components/Header";
import Home from "./views/Home";
import Proposal from "./views/Proposal";

const App = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        await isWallectConnected();

        if (getGlobalState("connectedAccount")) {
          await Promise.all([
            getInfo(),
            getProposals(),
          ]);
        }
      } catch (error) {
        console.error("Lỗi khởi tạo ứng dụng:", error);
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#212936] dark:text-gray-300">
      <Header />

      {loaded ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/proposal/:id"
            element={<Proposal />}
          />
          <Route
            path="*"
            element={
              <main className="p-8">
                <h2 className="text-2xl font-semibold">
                  Không tìm thấy trang
                </h2>
              </main>
            }
          />
        </Routes>
      ) : (
        <p className="p-8">Đang khởi tạo PTIT Dominion...</p>
      )}

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default App;
