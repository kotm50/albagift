import React, { useState } from "react";
import { useSelector } from "react-redux";

import axios from "axios";

import dayjs from "dayjs";
import "dayjs/locale/ko"; // 한국어 가져오기

import CouponModal from "./CouponModal";

function CouponList(props) {
  const [chkStat, setChkStat] = useState(false);
  const [stat, setStat] = useState("");
  const [statColor, setStatColor] = useState(
    "border border-sky-500 hover:border-sky-700 text-sky-500 hover:text-sky-700 hover:bg-sky-100"
  );
  const [statCode, setStatCode] = useState("");
  const [couponModal, setCouponModal] = useState(false);
  const user = useSelector(state => state.user);
  const calculateDaysLeft = d => {
    if (d !== null) {
      let dateOnly = d.split(" ")[0];
      // 현재 날짜를 가져옵니다.
      const currentDate = new Date();

      // 주어진 날짜를 Date 객체로 만듭니다. targetDate는 '2023-12-31'과 같은 형태여야 합니다.
      const endDate = new Date(dateOnly);

      // 두 날짜의 차이를 밀리초 단위로 계산합니다.
      const diffInMs = endDate - currentDate;

      // 밀리초를 일 단위로 변환합니다.
      const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

      return diffInDays < 6;
    }
  };

  const chkCoupon = async c => {
    const data = {
      trId: c,
    };
    await axios
      .post("/api/v1/shop/goods/coupons", data, {
        headers: { Authorization: user.accessToken },
      })
      .then(res => {
        if (res.data.pinStatusCd === "01") {
          setStatColor(
            "border border-sky-500 hover:border-sky-700 text-sky-500 hover:text-sky-700 hover:bg-sky-100"
          );

          setStat("사용가능");
        } else if (res.data.pinStatusCd === "02") {
          setStatColor(
            "border border-indigo-500 hover:border-indigo-700 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100"
          );
          setStat("사용완료");
        } else {
          setStatColor(
            "border border-rose-500 hover:border-rose-700 text-rose-500 hover:text-rose-700 hover:bg-rose-100"
          );
          setStat("사용불가");
        }
        setStatCode(res.data.pinStatusCd);
        setChkStat(true);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const openDetail = () => {
    if (statCode === "01") {
      setCouponModal(true);
    } else if (statCode === "") {
      return alert(
        "'사용가능 확인' 버튼을 눌러서 쿠폰이 사용가능한지 확인해주세요"
      );
    } else {
      return alert(`사용이 불가능한 쿠폰입니다\n사용불가사유 : ${stat}`);
    }
  };
  return (
    <>
      <div className="max-w-full h-28 xl:w-64 xl:h-64 overflow-hidden mx-auto">
        <img src={props.coupon.couponImgUrl} alt="쿠폰이미지" />
      </div>
      <div className="p-2 grid grid-cols-1 xl:grid-cols-5">
        <div className="font-medium">상품명</div>
        <div className="xl:col-span-4">
          {props.coupon.goodsName || "이름없음"}
        </div>
      </div>
      <div className="p-2 grid grid-cols-1 xl:grid-cols-5">
        <div className="font-medium">만료일</div>
        <div className="xl:col-span-4">
          {props.coupon.limitDate
            ? dayjs(props.coupon.limitDate).format("YY년 MM월 DD일")
            : "불명"}
          {calculateDaysLeft(props.coupon.limitDate) && (
            <span className="text-red-500 font-medium ml-2">만료임박</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div>
          <button
            className="transition duration-300 w-full border border-teal-500 hover:border-teal-700 bg-teal-500 hover:bg-teal-700 text-white text-lg p-2"
            onClick={e => openDetail()}
          >
            쿠폰상세확인
          </button>
        </div>
        <div>
          {!chkStat ? (
            <button
              className="transition duration-300 w-full border border-sky-500 hover:border-sky-700 text-sky-500 hover:text-sky-700 hover:bg-sky-100 text-lg p-2"
              onClick={e => chkCoupon(props.coupon.trId)}
            >
              사용가능확인
            </button>
          ) : (
            <div
              className={`transition duration-300 w-full ${statColor} text-lg text-center p-2`}
            >
              {stat}
            </div>
          )}
        </div>
        {couponModal ? (
          <CouponModal setCouponModal={setCouponModal} coupon={props.coupon} />
        ) : null}
      </div>
    </>
  );
}

export default CouponList;
