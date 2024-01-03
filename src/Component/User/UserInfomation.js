import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearUser, getNewToken, refreshPoint } from "../../Reducer/userSlice";
import { logout, logoutAlert } from "../LogoutUtil";
import axios from "axios";
import BeforeJoin from "./BeforeJoin";

function UserInformation() {
  const location = useLocation();
  const user = useSelector(state => state.user);
  const navi = useNavigate();
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const lastLogin = new Date(user.lastLogin);
    const now = new Date(); // 현재 시간을 가져옴 // 조건 1: lastLogin이 현재 시간보다 10시간 이상 이전이면 true
    const condition1 = now - lastLogin >= 10 * 60 * 60 * 1000;

    // 조건 2: lastLogin이 날짜 기준으로 하루 이상 지났고, 현재 시간이 오전 9시 이후 라면 true
    const condition2 =
      now.getDate() > lastLogin.getDate() && now.getHours() >= 9;

    if (condition1 || condition2) {
      // 조건 1 또는 조건 2를 만족하면 true
      dispatch(clearUser());
    }

    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    // const now = new Date();
    if (user.userId !== "") {
      // const diffTime = Math.floor((now - user.lastLogin) / 1000 / 60);
      refreshPoints();
      loginCompare(user.lastLogin);
    }
    //eslint-disable-next-line
  }, [location, user.accessToken]);

  const loginCompare = lastLogin => {
    const loginTime = new Date(lastLogin);
    // 현재 시간을 가져옵니다.
    const currentTime = new Date();

    // lastLogin에서 현재 시간을 빼서 경과 시간을 계산합니다.
    const elapsedMilliseconds = currentTime - loginTime;

    // 2시간(밀리초 단위) 이상 경과되었는지 확인합니다.
    const twoHoursInMilliseconds = 2 * 60 * 60 * 1000; // 2시간을 밀리초로 변환
    const isLate = elapsedMilliseconds >= twoHoursInMilliseconds;

    if (isLate) {
      dispatch(clearUser());
    }
  };

  const refreshPoints = async () => {
    await axios
      .post("/api/v1/user/get/point", null, {
        headers: { Authorization: user.accessToken },
      })
      .then(async res => {
        if (res.data.code === "E999") {
          logoutAlert(
            null,
            null,
            dispatch,
            clearUser,
            navi,
            user,
            res.data.message
          );
          return false;
        }
        if (res.data.user.point !== user.point) {
          dispatch(
            refreshPoint({
              point: res.data.user.point,
            })
          );
        }
        if (res.headers.authorization) {
          if (res.headers.authorization !== user.accessToken) {
            dispatch(
              getNewToken({
                accessToken: res.headers.authorization,
              })
            );
          }
        }
      })
      .catch(e => {
        if (user.admin) {
          return true;
        } else {
          return false;
          /*
          logoutAlert(
            null,
            logout,
            dispatch,
            clearUser,
            navi,
            user,
            "오류가 발생했습니다. 다시 로그인 해주세요"
          );
          */
        }
      });
  };

  return (
    <>
      {user.userId === "" ? (
        <>
          <div className="grid grid-cols-1 gap-y-2 lg:h-40">
            <div className="text-center mt-2 lg:mb-2">
              로그인하여 알바선물의
              <br className="lg:hidden" /> 다양한 혜택을 누려보세요!
            </div>
            <Link
              to="/login"
              className="block text-center p-3 text-white bg-teal-500 hover:bg-teal-700 hover:animate-wiggle rounded"
            >
              알바선물 로그인 하기
            </Link>
            <div className="w-11/12 lg:w-3/4 mx-auto grid grid-cols-3 divide-x-2 my-2">
              <Link
                to="/beforejoin"
                className="text-sm text-center text-gray-500 hover:text-blue-500 flex flex-col justify-center"
                onClick={e => {
                  e.preventDefault();
                  setModal(true);
                }}
              >
                회원가입
              </Link>
              <Link
                to="/cert?gubun=find"
                className="text-sm text-center text-gray-500 hover:text-blue-500 flex flex-col justify-center"
              >
                아이디 찾기
              </Link>
              <Link
                to="/findpwd"
                className="text-sm text-center text-gray-500 hover:text-blue-500 flex flex-col justify-center"
              >
                비밀번호 찾기
              </Link>
            </div>

            {modal ? <BeforeJoin setModal={setModal} /> : null}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-y-2 lg:h-40">
          <div className="text-center mt-2 lg:mb-2 grid grid-cols-2 lg:grid-cols-5 text-sm lg:text-base">
            <div className="font-neobold p-2 lg:col-span-2">
              안녕하세요 <span className="font-neoextra">{user.userName}</span>
              님
            </div>
            <div className="font-neobold p-2 lg:col-span-2">
              💎{" "}
              <span
                className="font-neoextra hover:text-sky-500 hover:cursor-pointer"
                onClick={e => navi("/mypage/pointhistory")}
              >
                {Number(user.point).toLocaleString()}
              </span>{" "}
              P
            </div>
            <button
              className="font-neobold p-2 border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-700 hover:bg-gray-100 rounded lg:col-span-1 col-span-2"
              onClick={e => logout(dispatch, clearUser, navi, user)}
            >
              로그아웃
            </button>
          </div>
          {user.admin ? (
            <>
              <button
                className="block text-center p-2 text-white bg-blue-500 hover:bg-blue-700 hover:animate-wiggle rounded"
                onClick={e => navi("/admin")}
              >
                관리자 페이지로
              </button>
              <div className="block text-center p-2 text-white opacity-0"></div>
            </>
          ) : (
            <>
              {" "}
              <button
                className="block text-center p-2 text-white bg-blue-500 hover:bg-blue-700 hover:animate-wiggle rounded"
                onClick={e => navi("/mypage/coupon")}
              >
                보유 쿠폰 확인하기
              </button>
              <button
                className="block text-center p-2 border border-blue-500 hover:text-blue-700 hover:border-blue-700 hover:animate-wiggle rounded mb-3 lg:mb-0"
                onClick={e => navi("/mypage")}
              >
                마이페이지
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default UserInformation;
