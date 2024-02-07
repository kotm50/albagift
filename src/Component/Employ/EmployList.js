import axios from "axios";
import queryString from "query-string";
import React, { useEffect, useRef, useState } from "react";
import { logoutAlert } from "../LogoutUtil";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getNewToken, clearUser } from "../../Reducer/userSlice";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import AlertModal from "../Layout/AlertModal";

import dayjs from "dayjs";

import { FaMapMarkerAlt } from "react-icons/fa";

import building from "../../Asset/employ/buiding.png";
import Pagenate from "../Layout/Pagenate";
import Loading from "../Layout/Loading";

function EmployList() {
  const divRef = useRef(null); // 단일 div 참조
  const navi = useNavigate();
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const thisLocation = useLocation();
  const pathName = thisLocation.pathname;
  const parsed = queryString.parse(thisLocation.search);
  const page = parsed.page || 1;
  const searchKeyword = parsed.keyword || "";
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [pagenate, setPagenate] = useState([]);

  const [height, setHeight] = useState(0);
  useEffect(() => {
    setKeyword(searchKeyword);
    getEmployList(page, searchKeyword);
    //eslint-disable-next-line
  }, [thisLocation]);

  const getEmployList = async (p, k) => {
    let data = {
      page: p,
      size: 1,
    };

    if (k !== "") {
      data.searchKeyword = k;
    }
    await axios
      .post("/api/v1/board/get/job/postlist", data, {
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

  useEffect(() => {
    // div 너비에 따라 높이 업데이트
    const updateHeight = () => {
      if (divRef.current) {
        const { width } = divRef.current.getBoundingClientRect();
        console.log(window.innerWidth > 1024);
        setHeight(window.innerWidth > 1024 ? width * 0.72 : width * 0.56);
      }
    };

    updateHeight();
    // 화면 크기 변경 시 높이 업데이트
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, [thisLocation]);

  return (
    <>
      {height > 0 ? (
        <>
          {list && list.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-x-4 gap-y-4 mt-4">
              {list.map((job, idx) => (
                <div
                  key={idx}
                  className="overflow-y-hidden flex flex-col justify-start employList"
                >
                  <Link
                    to={`/employ/detail/${job.jobCode}`}
                    className="hover:bg-blue-50 lg:p-2 rounded-lg"
                  >
                    <div
                      className="w-full overflow-hidden lg:rounded-lg mb-2 relative"
                      style={{ height: `${height}px` }}
                    >
                      {job.fileUrl ? (
                        <img
                          src={job.fileUrl}
                          alt={job.title}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 employThumbnail"
                          style={{ height: `${height}px` }}
                        />
                      ) : (
                        <img
                          src={building}
                          alt="기본이미지"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 employThumbnail"
                          style={{
                            height: `${height}px`,
                          }}
                        />
                      )}
                    </div>
                    <div className="px-2 lg:px-0 pb-7 grid grid-cols-1 gap-y-2 relative">
                      <div className="text-xs text-gray-600 absolute bottom-0 left-0 w-fit">
                        {dayjs(job.postingEndDate).format("YYYY-MM-DD")} 까지
                      </div>
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
                        <div className="flex flex-col justify-center">월</div>
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
          ) : null}
        </>
      ) : (
        <>
          <Loading />
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-x-4 gap-y-4 mt-4">
            <div
              ref={divRef}
              className="w-full overflow-hidden lg:rounded-lg mb-3 bg-gray-100 lg:h-[240px]"
            ></div>
          </div>
        </>
      )}

      <Pagenate
        pagenate={pagenate}
        page={Number(page)}
        totalPage={Number(totalPage)}
        pathName={pathName}
        keyword={keyword}
      />
    </>
  );
}

export default EmployList;
