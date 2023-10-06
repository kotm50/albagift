import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function Attendance() {
  const dates = ["일", "월", "화", "수", "목", "금", "토"];
  const [fullDate, setFullDate] = useState([]);
  const [month, setMonth] = useState("");
  const [before, setBefore] = useState([]);
  const [after, setAfter] = useState([]);
  const location = useLocation();

  useEffect(() => {
    getBeforeAfter();
    //eslint-disable-next-line
  }, [location]);

  const getFullDay = async () => {
    // 현재 날짜를 얻기 위한 Date 객체 생성
    const currentDate = new Date();

    // 이번달의 월과 연도를 얻기
    const currentMonth = currentDate.getMonth() + 1; // 월은 0부터 시작하므로 +1 해줍니다.
    const currentYear = currentDate.getFullYear();

    // 이번달의 첫 번째 날을 구하고 해당 요일을 얻기
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0(일요일)부터 6(토요일)까지의 값입니다.

    // 이번달의 마지막 날을 구하기
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
    const lastDateOfMonth = lastDayOfMonth.getDate();

    // 날짜와 요일 정보를 배열에 추가
    const calendarData = [];
    for (let i = 1; i <= lastDateOfMonth; i++) {
      const dayOfWeek = (firstDayOfWeek + i - 1) % 7;
      const dayOfWeekText = ["일", "월", "화", "수", "목", "금", "토"][
        dayOfWeek
      ];
      calendarData.push({ day: i, date: dayOfWeekText });
    }

    // 결과를 state에 저장
    setMonth(currentMonth);
    setFullDate(calendarData);
  };

  const getBeforeAfter = async () => {
    // 현재 날짜를 얻기 위한 Date 객체 생성
    const currentDate = new Date();

    // 이번달의 첫 번째 날 구하기
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const firstDayOfWeek = firstDayOfMonth.toLocaleDateString("ko-KR", {
      weekday: "short",
    });

    // 이번달의 마지막 날 구하기
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const lastDayOfWeek = lastDayOfMonth.toLocaleDateString("ko-KR", {
      weekday: "short",
    });

    await getBeforeAfterDate(firstDayOfWeek, lastDayOfWeek);
    getFullDay();
  };

  const getBeforeAfterDate = (f, l) => {
    const beforeLength = dates.indexOf(f);
    const afterLength = dates.indexOf(l);
    let bArr = [];
    let aArr = [];
    let i, j;
    if (beforeLength > 0) {
      for (i = 0; i <= beforeLength + 1; i++) {
        bArr.push("공백");
      }
      setBefore(bArr);
    }

    if (afterLength > 0) {
      for (j = 0; j <= afterLength + 1; j++) {
        aArr.push("공백");
      }
      setAfter(aArr);
    }

    console.log(beforeLength, afterLength);
  };

  return (
    <>
      <div className="container mx-auto">
        <h2 className="text-3xl font-neoextra">{month}월의 출석체크</h2>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dates.map((date, idx) => (
            <div
              className={`text-center rounded-lg ${
                idx === 0
                  ? "border border-orange-500 bg-orange-500 text-white"
                  : idx === 6
                  ? "border border-blue-500 bg-blue-500 text-white"
                  : "border border-gray-300"
              }`}
              key={idx}
            >
              {date}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {before.length > 0 && (
            <>
              {before.map((date, idx) => (
                <div
                  className="bg-gray-100 text-gray-100 rounded-lg border border-gray-100"
                  key={idx}
                >
                  {date}
                </div>
              ))}
            </>
          )}
          {fullDate.length > 0 && (
            <>
              {fullDate.map((date, idx) => (
                <div
                  className={`bg-white-100 rounded-lg p-2 border shadow-sm ${
                    date.date === "일"
                      ? "border-orange-300"
                      : date.date === "토"
                      ? "border-blue-300"
                      : null
                  }`}
                  key={idx}
                >
                  {date.day}/{date.date}요일
                </div>
              ))}
            </>
          )}
          {after.length > 0 && (
            <>
              {after.map((date, idx) => (
                <div
                  className="bg-gray-100 text-gray-100 border-gray-100"
                  key={idx}
                >
                  {date}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Attendance;
