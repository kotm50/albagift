import React, { useEffect, useState } from "react";

import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import queryString from "query-string";
import { clearUser, getNewToken } from "../../../Reducer/userSlice";
import { logoutAlert } from "../../LogoutUtil";
import AlertModal from "../../Layout/AlertModal";
import { useDispatch, useSelector } from "react-redux";
import Pagenate from "../../Layout/Pagenate";
import Loading from "../../Layout/Loading";
import dayjs from "dayjs";
import { FaMapMarkerAlt } from "react-icons/fa";

function Job() {
  const navi = useNavigate();
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const thisLocation = useLocation();
  const pathName = thisLocation.pathname;
  const parsed = queryString.parse(thisLocation.search);
  const page = parsed.page || 1;
  const [totalPage, setTotalPage] = useState(1);
  const [pagenate, setPagenate] = useState([]);
  const [list, setList] = useState([]);
  useEffect(() => {
    getJobs(page);
    //eslint-disable-next-line
  }, [thisLocation]);

  const getJobs = async p => {
    let data = {
      page: p,
      size: 20,
    };
    await axios
      .post("/api/v1/board/get/mypage/applylist", data, {
        headers: { Authorization: user.accessToken },
      })
      .then(async res => {
        console.log(res.data.jobList);
        if (res.headers.authorization) {
          await dispatch(
            getNewToken({
              accessToken: res.headers.authorization,
            })
          );
        }

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
        const totalP = res.data.totalPages;
        setTotalPage(res.data.totalPages);
        const pagenate = generatePaginationArray(p, totalP);
        setPagenate(pagenate);
        setList(res.data.jobList);
      })
      .catch(e => {
        console.log(e);
        confirmAlert({
          customUI: ({ onClose }) => {
            return (
              <AlertModal
                onClose={onClose} // 닫기
                title={"오류"} // 제목
                message={"오류가 발생했습니다. 관리자에게 문의하세요"} // 내용
                type={"alert"} // 타입 confirm, alert
                yes={"확인"} // 확인버튼 제목
              />
            );
          },
        });
        setList([]);
      });
  };

  function generatePaginationArray(currentPage, totalPage) {
    let paginationArray = [];

    // 최대 페이지가 4 이하인 경우
    if (Number(totalPage) <= 4) {
      for (let i = 1; i <= totalPage; i++) {
        paginationArray.push(i);
      }
      return paginationArray;
    }

    // 현재 페이지가 1 ~ 3인 경우
    if (Number(currentPage) <= 3) {
      return [1, 2, 3, 4, 5];
    }

    // 현재 페이지가 totalPage ~ totalPage - 2인 경우
    if (Number(currentPage) >= Number(totalPage) - 2) {
      return [
        Number(totalPage) - 4,
        Number(totalPage) - 3,
        Number(totalPage) - 2,
        Number(totalPage) - 1,
        Number(totalPage),
      ];
    }

    // 그 외의 경우
    return [
      Number(currentPage) - 2,
      Number(currentPage) - 1,
      Number(currentPage),
      Number(currentPage) + 1,
      Number(currentPage) + 2,
    ];
  }
  return (
    <>
      {list && list.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-4 gap-y-4 mt-4 px-4 lg:px-0 lg:hidden">
            {list.map((job, idx) => (
              <div
                key={idx}
                className="overflow-y-hidden flex flex-col justify-start bg-white rounded-lg drop-shadow hover:bg-blue-50 hover:drop-shadow-lg"
              >
                <Link to={`/employ/detail/${job.jobCode}`}>
                  <div className="p-4 grid grid-cols-1 gap-y-2 relative">
                    <div className="text-rose-500 font-neobold text-sm">
                      면접시{" "}
                      <span className="font-neoheavy">
                        {job.intvPoint.toLocaleString()}P
                      </span>{" "}
                      지급
                    </div>
                    <div className="w-full overflow-x-hidden font-neoextra truncate text-lg pb-1">
                      {job.title || "테스트"}
                    </div>
                    <div className="text-sm flex flex-row justify-start gap-x-1 font-neoextra">
                      <div className="flex flex-col justify-center text-orange-600">
                        월
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="items-center">
                          {job.salary.toLocaleString()} 원
                        </span>
                      </div>
                    </div>
                    <div className="text-sm flex flex-row justify-start gap-x-1">
                      <div className="flex flex-col justify-center">
                        <FaMapMarkerAlt className="items-center" size={16} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="items-center">
                          {job.detailAddr || "위치문의"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <table className="hidden lg:table w-full mt-4">
            <thead>
              <tr className="">
                <td className="border-y border-t-2 border-stone-500 text-center p-2 w-[200px]">
                  지역
                </td>
                <td className="border-y border-t-2 border-stone-500 text-center p-2">
                  제목
                </td>
                <td className="border-y border-t-2 border-stone-500 text-center p-2 w-[200px]">
                  급여
                </td>
                <td className="border-y border-t-2 border-stone-500 text-center p-2 w-[200px]">
                  면접포인트
                </td>
                <td className="border-y border-t-2 border-stone-500 text-center p-2 w-[200px]">
                  종료일
                </td>
              </tr>
            </thead>
            <tbody>
              {list.map((job, idx) => (
                <tr
                  key={idx}
                  className="text-sm hover:cursor-pointer"
                  onClick={() => navi(`/employ/detail/${job.jobCode}`)}
                >
                  <td className="border-b border-gray-300 text-center px-2 py-4">
                    {job.compArea || "문의 후 확인"}
                  </td>
                  <td className="border-b border-gray-300 text-lg px-2 py-4 truncate font-neoextra">
                    {job.title}
                  </td>
                  <td className="border-b border-gray-300 text-center px-2 py-4">
                    <span className="text-orange-600 font-neoextra">월</span>{" "}
                    {job.salary.toLocaleString()} 원
                  </td>
                  <td className="border-b border-gray-300 text-center px-2 py-4">
                    <span className="text-rose-500 font-neoextra">
                      {job.intvPoint.toLocaleString()}P 지급
                    </span>
                  </td>
                  <td className="border-b border-gray-300 text-center px-2 py-4">
                    {dayjs(job.postingEndDate).format("YYYY-MM-DD")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <Loading />
      )}

      <Pagenate
        pagenate={pagenate}
        page={Number(page)}
        totalPage={Number(totalPage)}
        pathName={pathName}
      />
    </>
  );
}

export default Job;
