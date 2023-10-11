import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { clearUser } from "../../../Reducer/userSlice";

import { FaTicketAlt } from "react-icons/fa";

function Cancel() {
  const navi = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(state => state.user);
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [point, setPoint] = useState(0);
  const [isErr, setIsErr] = useState(false);
  const [errMessage, setErrMessage] = useState("");

  useEffect(() => {
    setId(user.userId);
    setPoint(Number(user.point));
    //eslint-disable-next-line
  }, [location]);

  const cancelIt = async e => {
    e.preventDefault();
    const really = window.confirm("정말 탈퇴하시겠습니까?");
    if (!really) {
      alert("탈퇴를 취소하셨습니다.\n메인페이지로 이동합니다");
      navi("/");
      return false;
    }
    const data = {
      userPwd: pwd,
    };
    await axios
      .post("/api/v1/user/myinfo/pwdchk", data, {
        headers: { Authorization: user.accessToken },
      })
      .then(res => {
        console.log(res);
        if (res.data.code === "C000") {
          deleteId();
        } else {
          setErrMessage(res.data.message);
          setIsErr(true);
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  const deleteId = async () => {
    await axios
      .patch("/api/v1/user/myinfo/delete", null, {
        headers: { Authorization: user.accessToken },
      })
      .then(res => {
        if (res.data.code === "C000") {
          logout();
        } else {
          setErrMessage(res.data.message);
          setIsErr(true);
        }
      })
      .catch(e => {
        console.log(e);
      });
  };
  const logout = async () => {
    await axios
      .post("/api/v1/user/logout", null, {
        headers: { Authorization: user.accessToken },
      })
      .then(res => {
        alert("회원탈퇴가 완료되었습니다.\n이용해 주셔서 감사합니다.");
      })
      .catch(e => {
        console.log(e);
      });
    dispatch(clearUser());
    navi("/login");
  };
  return (
    <form onSubmit={e => cancelIt(e)}>
      <div
        id="cancelArea"
        className="my-2 mx-auto p-2 xl:p-10 border shadow-lg rounded-lg grid grid-cols-1 gap-3 bg-white w-full"
      >
        <div className="text-base font-neobold text-left">
          <div className="font-neoextra text-xl">
            {id || "무명회원"}님!
            <br /> 탈퇴 하기 전에 확인해 주세요
          </div>
          <div className="bg-gray-100 mt-2 p-3 text-base">
            회원탈퇴를 진행하시면 <br className="xl:hidden" />
            <span className="text-blue-500">30일의 유예기간</span>이 부여되며{" "}
            <br />
            유예기간 경과시 <br className="xl:hidden" />
            아래 항목이 삭제됩니다.
            <div className="p-4 bg-white rounded-lg mt-2 text-sm">
              <ol className="flex flex-col gap-y-3 list-decimal pl-4">
                <li>
                  잔여포인트는{" "}
                  <span className="text-red-500 font-neoextra">
                    즉시 소멸됩니다.
                  </span>
                  <div className="xl:w-1/2 mx-auto my-2 p-2 border border-sky-500 text-center">
                    잔여 포인트
                    <br />
                    <span
                      className={`${
                        point > 10000
                          ? "text-2xl"
                          : point > 4000
                          ? "text-xl"
                          : "text-lg"
                      } font-neoheavy text-sky-500`}
                    >
                      {point.toLocaleString()}
                    </span>
                    p
                  </div>
                </li>
                <li>
                  보유쿠폰은 쿠폰 이미지를 별도 저장하지 않으면{" "}
                  <span className="text-red-500 font-neoextra">
                    열람이 불가합니다.
                  </span>
                  <br />
                  아래 버튼을 눌러 보유쿠폰을 확인하고 저장하세요.
                  <Link
                    to="/mypage/coupon"
                    className="block xl:w-1/2 mx-auto my-2 p-2 border border-sky-500 hover:border-sky-700 hover:bg-sky-100 text-center"
                  >
                    <FaTicketAlt className="inline" size={20} /> 보유쿠폰확인
                  </Link>
                </li>
                <li>
                  탈퇴 후 1년간 재가입을 진행해도 프로모션 포인트는{" "}
                  <span className="text-red-500 font-neoextra">
                    지급되지 않습니다
                  </span>
                </li>
                <li>
                  소비자보호에 관한 법령에 의거 아래 개인정보는 1년간 보관 후
                  파기됩니다.
                  <ul className="ml-2 list-disc">
                    <li>포인트 지급 및 사용 내역</li>
                    <li>불만 또는 분쟁처리에 관한 기록</li>
                    <li>부정이용(포인트 부정수급 등) 기록</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>
        <div
          id="pwd"
          className="grid grid-cols-1 xl:grid-cols-5 xl:divide-x xl:border"
        >
          <label
            htmlFor="inputPwd"
            className="text-sm text-left xl:text-right flex flex-col justify-center mb-2 xl:mb-0 xl:pr-2 xl:bg-gray-100"
          >
            비밀번호
          </label>
          <div className="xl:col-span-4">
            <input
              type="password"
              id="inputPwd"
              className="border xl:border-0 p-2 w-full text-sm"
              value={pwd}
              onChange={e => setPwd(e.currentTarget.value)}
              onBlur={e => setPwd(e.currentTarget.value)}
              autoComplete="on"
            />
          </div>
        </div>
        {isErr && (
          <div className="text-center text-sm pb-2 text-rose-500">
            {errMessage}
          </div>
        )}
        <div className="w-full flex flex-row justify-center gap-1">
          <Link
            to="/"
            className="transition duration-100 w-full text-center bg-blue-500 hover:bg-blue-700 border border-blue-500 hover:border-blue-700 p-2 text-white rounded"
          >
            서비스 계속 이용
          </Link>
          <button
            className="transition duration-100 w-full border border-gray-500 hover:border-gray-700 p-2 text-gray-500 hover:text-gray-700 rounded"
            type="submit"
          >
            회원 탈퇴하기
          </button>
        </div>
      </div>
    </form>
  );
}

export default Cancel;
