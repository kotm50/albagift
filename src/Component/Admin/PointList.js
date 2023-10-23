import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { getNewToken } from "../../Reducer/userSlice";

import { confirmAlert } from "react-confirm-alert"; // 모달창 모듈
import "react-confirm-alert/src/react-confirm-alert.css"; // 모달창 css

import queryString from "query-string";

import dayjs from "dayjs";
import "dayjs/locale/ko";

import Loading from "../Layout/Loading";
import Pagenate from "../Layout/Pagenate";
import AlertModal from "../Layout/AlertModal";
import Sorry from "../doc/Sorry";

function PointList() {
  const navi = useNavigate();
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);
  const [list, setList] = useState([]);
  const user = useSelector(state => state.user);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedDocsId, setSelectedDocsId] = useState([]);
  const location = useLocation();
  const pathName = location.pathname;
  const parsed = queryString.parse(location.search);
  const page = parsed.page || 1;
  const keyword = parsed.keyword || "";
  const startDate = parsed.startDate || "";
  const endDate = parsed.endDate || "";
  const [point, setPoint] = useState("");
  const [reason, setReason] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [pagenate, setPagenate] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [inputStartDate, setInputStartDate] = useState("");
  const [inputEndDate, setInputEndDate] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");

  useEffect(() => {
    setList([]);
    if (keyword !== "") {
      setSearchKeyword(keyword);
    }
    if (startDate !== "") {
      setInputStartDate(startDate);
    }
    if (endDate !== "") {
      setInputEndDate(endDate);
    }
    loadList(page, keyword, startDate, endDate);
    //eslint-disable-next-line
  }, [location, user.accessToken]);

  //날짜수정
  useEffect(() => {
    if (inputStartDate !== "") {
      setSearchStartDate(dayjs(inputStartDate).format("YYYY-MM-DD"));
    } else {
      setSearchStartDate("");
    }
    if (inputEndDate !== "") {
      setSearchEndDate(dayjs(inputEndDate).format("YYYY-MM-DD"));
    } else {
      setSearchEndDate("");
    }
    //eslint-disable-next-line
  }, [inputStartDate, inputEndDate]);

  const checkDocs = (doc, checked) => {
    if (checked) {
      // 체크박스가 선택된 경우, 아이템을 배열에 추가
      setSelectedDocs([
        ...selectedDocs,
        { postId: doc.postId, phone: doc.phone, name: doc.userName },
      ]);
      setSelectedDocsId([
        ...selectedDocsId,
        { postId: doc.postId, boardId: "B02" },
      ]);
    } else {
      // 체크박스가 선택 해제된 경우, 아이템을 배열에서 제거
      setSelectedDocs(selectedDocs.filter(item => item.postId !== doc.postId));
      // 체크박스가 선택 해제된 경우, 아이템을 배열에서 제거
      setSelectedDocsId(
        selectedDocsId.filter(item => item.postId !== doc.postId)
      );
    }
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchIt();
    }
  };

  const pointSubmit = async b => {
    const postList = await payments(selectedDocsId, b);
    console.log(postList);
    const request = {
      postList: postList,
    };
    await axios
      .patch("/api/v1/board/admin/paymt/sts", request, {
        headers: { Authorization: user.accessToken },
      })
      .then(res => {
        if (res.headers.authorization) {
          dispatch(
            getNewToken({
              accessToken: res.headers.authorization,
            })
          );
        }
        if (res.data.code === "C000") {
          confirmAlert({
            customUI: ({ onClose }) => {
              return (
                <AlertModal
                  onClose={onClose} // 닫기
                  title={"완료"} // 제목
                  message={res.data.message} // 내용
                  type={"alert"} // 타입 confirm, alert
                  yes={"확인"} // 확인버튼 제목
                />
              );
            },
          });
          if (res.headers.authorization === user.accessToken) {
            loadList(page, keyword, startDate, endDate);
          }
          setPoint(0);
          setSelectedDocs([]);
          setSelectedDocsId([]);
        }
      })
      .catch(e => {
        console.log(e);
      });
  };

  const loadList = async (p, k, s, e) => {
    setLoaded(false);
    let data = {
      page: p,
      size: 20,
    };
    if (k !== "") {
      data.searchKeyword = k;
    }
    if (s !== "") {
      data.startDate = s;
    }
    if (e !== "") {
      data.endDate = e;
    }
    await axios
      .get("/api/v1/board/admin/posts", {
        params: data,
        headers: {
          Authorization: user.accessToken,
        },
      })
      .then(res => {
        console.log(res);
        if (res.headers.authorization) {
          dispatch(
            getNewToken({
              accessToken: res.headers.authorization,
            })
          );
        }
        setLoaded(true);
        if (res.data.code === "C000") {
          const totalP = res.data.totalPages;
          setTotalPage(res.data.totalPages);
          const pagenate = generatePaginationArray(p, totalP);
          setPagenate(pagenate);
        }
        if (res.data.postList.length === 0) {
          return false;
        }
        setList(res.data.postList ?? [{ postId: "없음" }]);
      })
      .catch(e => {
        setLoaded(true);
        confirmAlert({
          customUI: ({ onClose }) => {
            return (
              <AlertModal
                onClose={onClose} // 닫기
                title={"오류"} // 제목
                message={"알 수 없는 오류가 발생했습니다"} // 내용
                type={"alert"} // 타입 confirm, alert
                yes={"확인"} // 확인버튼 제목
                doIt={goBack} // 확인시 실행할 함수
              />
            );
          },
        });
        return false;
      });

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
  };

  const goBack = () => {
    navi(-1);
  };

  const searchIt = () => {
    let isAfter = true;
    if (inputStartDate !== "") {
      isAfter = inputStartDate <= inputEndDate;
    }
    console.log(isAfter);
    if (!isAfter) {
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <AlertModal
              onClose={onClose} // 닫기
              title={"조회 실패"} // 제목
              message={"시작일은 종료일보다 이전이어야 합니다"} // 내용
              type={"alert"} // 타입 confirm, alert
              yes={"확인"} // 확인버튼 제목
              doIt={dateReset}
            />
          );
        },
      });
      return false;
    }
    let domain = `${pathName}${
      searchKeyword !== "" ? `?keyword=${searchKeyword}` : ""
    }${searchKeyword !== "" ? "&" : "?"}${
      searchStartDate !== "" && searchEndDate !== ""
        ? `startDate=${searchStartDate}&endDate=${searchEndDate}`
        : ""
    }`;
    navi(domain);
  };
  const dateReset = () => {
    setInputStartDate("");
    setInputEndDate("");
  };
  const formatPhoneNumber = phoneNumber => {
    return phoneNumber.slice(-4);
  };

  const handleChangeSelect = e => {
    setReason(e.currentTarget.value);
  };

  const payments = (p, b) => {
    let payArr = [];

    p.forEach(p => {
      if (b) {
        p.status = "Y";
        p.result = point;
      } else {
        p.status = "N";
        p.result = reason;
      }
      payArr.push(p);
    });
    return payArr;
  };

  useEffect(() => {
    // selectedDocs가 비어있을 때 모든 체크를 해제
    if (selectedDocs.length === 0) {
      list.forEach(doc => {
        document.getElementById(doc.postId).checked = false;
      });
    }
    //eslint-disable-next-line
  }, [selectedDocs]);

  return (
    <>
      {loaded ? (
        <>
          <h2 className="p-4 text-center font-neoheavy text-3xl">
            지급 신청 목록
          </h2>
          <div className="flex justify-between container mx-auto">
            <div className="flex flex-row justify-start gap-3 mb-4 container mx-auto pl-4">
              <div className="font-neoextra text-lg p-2">검색어</div>
              <div>
                <input
                  value={searchKeyword}
                  className="border border-gray-300 p-2 w-80 block rounded-lg font-neo"
                  placeholder="이름 또는 연락처를 입력해 주세요"
                  onChange={e => setSearchKeyword(e.currentTarget.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="grid grid-cols-2">
                <div className="flex justify-start">
                  <div className="font-neoextra text-lg p-2">조회 시작일</div>
                  <input
                    type="date"
                    value={inputStartDate}
                    className="border border-gray-300 p-2 w-80 block rounded-lg font-neo"
                    placeholder="이름 또는 연락처를 입력해 주세요"
                    onChange={e => setInputStartDate(e.currentTarget.value)}
                  />
                </div>
                <div className="flex justify-start">
                  <div className="font-neoextra text-lg p-2">조회 종료일</div>
                  <input
                    type="date"
                    value={inputEndDate}
                    className="border border-gray-300 p-2 w-80 block rounded-lg font-neo"
                    placeholder="이름 또는 연락처를 입력해 주세요"
                    onChange={e => setInputEndDate(e.currentTarget.value)}
                  />
                </div>
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded-sm text-white"
                onClick={searchIt}
              >
                검색하기
              </button>

              <button
                className="bg-gray-500 hover:bg-gray-700 py-2 px-4 rounded-sm text-white"
                onClick={e => {
                  setSearchKeyword("");
                  setInputStartDate("");
                  setInputEndDate("");
                }}
              >
                초기화
              </button>
            </div>
          </div>
          {list.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-2 mt-2 bg-white p-2 container mx-auto">
              {list.map((doc, idx) => (
                <div key={idx}>
                  <input
                    type="checkbox"
                    value={doc.postId}
                    className="hidden peer"
                    id={doc.postId}
                    onChange={e => checkDocs(doc, e.target.checked)}
                    disabled={doc.status !== "S"}
                  />
                  <label
                    htmlFor={doc.postId}
                    className={`block p-2 ${
                      doc.status === "S"
                        ? "bg-teal-50 hover:bg-teal-200 text-black rounded-lg border-2 border-teal-50 hover:border-teal-200 peer-checked:border-teal-500 peer-checked:hover:border-teal-500"
                        : "bg-gray-50 hover:bg-gray-200 text-black rounded-lg border-2 border-gray-50 hover:border-gray-200 peer-checked:border-gray-500 peer-checked:hover:border-gray-500"
                    }`}
                  >
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="font-medium flex flex-col justify-center text-right">
                        이름
                      </div>
                      <div className="font-normal col-span-2 flex flex-col justify-center">
                        {doc.userName}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="font-medium flex flex-col justify-center text-right">
                        연락처
                      </div>
                      <div className="font-normal col-span-2 flex flex-col justify-center">
                        {formatPhoneNumber(doc.phone)}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="font-medium flex flex-col justify-center text-right">
                        면접일시
                      </div>
                      <div
                        className="font-normal col-span-2 flex flex-col justify-center"
                        title={doc.intvDate}
                      >
                        {doc.intvDate} {doc.intvTime}시 {doc.intvMin}분
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="font-medium flex flex-col justify-center text-right">
                        지급여부
                      </div>
                      <div
                        className="font-normal col-span-2 flex flex-col justify-center"
                        title="지급여부"
                      >
                        {doc.status === "S" ? (
                          <span className="text-blue-500">지급대기</span>
                        ) : doc.status === "N" ? (
                          <span className="text-red-500">지급불가</span>
                        ) : doc.status === "Y" ? (
                          <span className="text-green-500">지급완료</span>
                        ) : (
                          "오류"
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <Sorry message={"조회된 내역이 없습니다"} />
          )}

          <Pagenate
            pagenate={pagenate}
            page={Number(page)}
            totalPage={Number(totalPage)}
            pathName={pathName}
            keyword={keyword}
            startDate={startDate}
            endDate={endDate}
          />

          {selectedDocs.length > 0 && (
            <>
              <div className="fixed container bottom-0 left-1/2 -translate-x-1/2 bg-white p-3 rounded-t-xl drop-shadow-xl">
                <div className="test-xl xl:text-2xl font-medium text-left">
                  포인트 지급(차감)대상
                </div>
                <div className="mt-2 flex flex-row flex-wrap gap-2">
                  {selectedDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-yellow-50 rounded-xl flex flex-col gap-2 justify-center"
                    >
                      <p>이름 : {doc.name}</p>
                      <p>연락처 : {doc.phone}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-1 xl:grid-cols-2 gap-2">
                  <div className="grid grid-cols-1 gap-2 bg-blue-50 p-2">
                    <div className="text-lg font-neoextra">포인트 지급처리</div>
                    <input
                      type="number"
                      className="p-2 bg-white border font-medium"
                      value={point}
                      onChange={e => setPoint(e.currentTarget.value)}
                      onBlur={e => setPoint(e.currentTarget.value)}
                    />
                    <button
                      className="transition duration-150 ease-out p-2 bg-sky-500 hover:bg-sky-700 text-white rounded-lg font-medium hover:animate-wiggle"
                      onClick={e => pointSubmit(true)}
                    >
                      지급처리
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 bg-rose-50 p-2">
                    <div className="text-lg font-neoextra">
                      포인트 지급불가처리
                    </div>
                    <select
                      className="p-2 bg-white border font-medium"
                      onChange={handleChangeSelect}
                      value={reason}
                    >
                      <option value="">불가사유를 선택해 주세요</option>
                      <option value="중복신청">중복신청</option>
                      <option value="면접기록없음">면접기록없음</option>
                    </select>
                    <button
                      className="transition duration-150 ease-out p-2  border bg-red-500 text-white font-medium rounded-lg  hover:bg-red-700  hover:animate-wiggle"
                      onClick={e => pointSubmit(false)}
                    >
                      지급불가처리
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <Loading />
      )}
    </>
  );
}

export default PointList;
