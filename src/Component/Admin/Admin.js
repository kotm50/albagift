import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { confirmAlert } from "react-confirm-alert"; // 모달창 모듈
import "react-confirm-alert/src/react-confirm-alert.css"; // 모달창 css

import axios from "axios";
import AlertModal from "../Layout/AlertModal";

function Admin() {
  const location = useLocation();
  const [loaded, setLoaded] = useState(false);
  let navi = useNavigate();
  const user = useSelector(state => state.user);
  useEffect(() => {
    chkAdmin(user);
    //eslint-disable-next-line
  }, [location]);

  const chkAdmin = async user => {
    await axios
      .post("/api/v1/user/rolechk", null, {
        headers: { Authorization: user.accessToken },
      })
      .then(res => {
        if (res.data.code !== "A100") {
          confirmAlert({
            customUI: ({ onClose }) => {
              return (
                <AlertModal
                  onClose={onClose} // 닫기
                  title={"오류!!"} // 제목
                  message={
                    "관리자 전용 페이지입니다, 메인으로 이동합니다\n관리자 계정으로 로그인 하세요"
                  } // 내용
                  type={"alert"} // 타입 confirm, alert
                  yes={"확인"} // 확인버튼 제목
                  doIt={goMain} // 확인시 실행할 함수
                />
              );
            },
          });
        } else {
          setLoaded(true);
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  const goMain = () => {
    navi("/");
  };

  const resetGoods = async () => {
    await axios
      .post("/api/v1/shop/admin/bizapi", null, {
        headers: { Authorization: user.accessToken },
      })
      .then(res => {
        if (res.data.code === "C000") {
          confirmAlert({
            customUI: ({ onClose }) => {
              return (
                <AlertModal
                  onClose={onClose} // 닫기
                  title={"완료"} // 제목
                  message={"상품리셋 완료"} // 내용
                  type={"alert"} // 타입 confirm, alert
                  yes={"확인"} // 확인버튼 제목
                />
              );
            },
          });
          return true;
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  const resetBrands = async () => {
    await axios
      .post("/api/v1/shop/admin/brand", null, {
        headers: { Authorization: user.accessToken },
      })
      .then(res => {
        if (res.data.code === "C000") {
          confirmAlert({
            customUI: ({ onClose }) => {
              return (
                <AlertModal
                  onClose={onClose} // 닫기
                  title={"완료"} // 제목
                  message={"브랜드리셋 완료"} // 내용
                  type={"alert"} // 타입 confirm, alert
                  yes={"확인"} // 확인버튼 제목
                />
              );
            },
          });
          return true;
        }
      })
      .catch(e => {
        console.log(e);
      });
  };
  return (
    <>
      {loaded && (
        <>
          <div className="bg-white p-2 container mx-auto">
            <div className="flex justify-between mb-3 p-2">
              <div className="mb-2 text-xl xl:text-3xl">
                안녕하세요 면접샵 관리자 페이지 입니다
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="bg-indigo-500 hover:bg-indigo-700 text-white p-2"
                  onClick={resetGoods}
                >
                  상품 리셋
                </button>
                <button
                  className="bg-indigo-500 hover:bg-indigo-700 text-white p-2"
                  onClick={resetBrands}
                >
                  브랜드 리셋
                </button>
              </div>
              <button
                className="p-2 bg-green-500 text-white hover:bg-green-700"
                onClick={e => navi("/")}
              >
                알바선물 메인으로
              </button>
            </div>
            <div className="grid grid-cols-5 divide-x-2 bg-indigo-50 mb-2 border">
              <Link
                to="/admin/"
                className="hover:bg-indigo-100 p-2 text-center"
              >
                메인으로
              </Link>
              <Link
                to="/admin/pointlist"
                className="hover:bg-indigo-100 p-2 text-center"
              >
                지급 신청 목록
              </Link>
              <Link
                to="/admin/user"
                className="hover:bg-indigo-100 p-2 text-center"
              >
                회원목록
              </Link>
              <Link
                to="/admin/loginlog"
                className="hover:bg-indigo-100 p-2 text-center"
              >
                로그인 기록
              </Link>
              <Link
                to="/admin/transfer"
                className="hover:bg-indigo-100 p-2 text-center"
              >
                구버전 회원
              </Link>
            </div>
          </div>

          <Outlet />
        </>
      )}
    </>
  );
}

export default Admin;
