import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import AlertModal from "../Layout/AlertModal";
import { confirmAlert } from "react-confirm-alert"; // 모달창 모듈
import "react-confirm-alert/src/react-confirm-alert.css"; // 모달창 css
import axiosInstance from "../../Api/axiosInstance";
function ShopRecommend(props) {
  const location = useLocation();
  const user = useSelector(state => state.user);
  const [goods, setGoods] = useState([]);
  const [loadMsg, setLoadMsg] = useState("상품을 불러오고 있습니다");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getGoods();
    //eslint-disable-next-line
  }, [location]);

  const getGoods = async c => {
    let listUrl = "/api/v1/shop/get/rand/goods";

    setGoods([]);
    await axiosInstance
      .get(listUrl, {
        headers: { Authorization: user.accessToken },
      })
      .then(async res => {
        setLoadMsg(res.data.message);
        if (res.data.code === "C000") {
          if (c === 1) {
            setGoods(res.data.cafeList);
            if (res.data.cafeList.length > 0) {
              setLoaded(true);
            }
          } else {
            setGoods(res.data.randList);
            if (res.data.randList.length > 0) {
              setLoaded(true);
            }
          }
        } else {
          return false;
        }
      })
      .catch(e => {
        setLoadMsg("오류가 발생했습니다");
        if (props.first) {
          confirmAlert({
            customUI: ({ onClose }) => {
              return (
                <AlertModal
                  onClose={onClose} // 닫기
                  title={"오류"} // 제목
                  message={
                    "상품 불러오기를 실패했습니다\n관리자에게 문의해주세요"
                  } // 내용
                  type={"alert"} // 타입 confirm, alert
                  yes={"확인"} // 확인버튼 제목
                />
              );
            },
          });
        }
      });
  };

  return (
    <div className="p-2 bg-gray-100">
      <div className="lg:container mx-auto">
        <div className="overflow-x-auto w-full mx-auto my-2">
          <h3 className="text-lg lg:text-xl font-lineseed py-2 px-2">
            면접 포인트로 상품을 구입해 보세요!
          </h3>
          {loaded ? (
            <div
              id="recommendList"
              className="mx-auto my-2 flex flex-row flex-nowrap overflow-x-auto lg:grid lg:grid-cols-5 w-full"
            >
              {goods.map((good, idx) => (
                <Link
                  key={idx}
                  to={`/detail/${good.goodsCode}`}
                  className="giftcategory flex-shrink-0 lg:w-auto p-1"
                >
                  <div className="group p-2 rounded recommendListItem w-32 lg:w-auto">
                    <div className="w-32 h-32 lg:w-64 lg:h-64 mx-auto rounded overflow-hidden max-w-full drop-shadow hover:drop-shadow-lg">
                      <img
                        src={good.goodsImgS}
                        alt={good.goodsName}
                        className="fixed top-0 left-0 w-0 h-0 opacity-0"
                        onLoad={e => setImgLoaded(true)}
                      />
                      {imgLoaded ? (
                        <img
                          src={good.goodsImgS}
                          alt={good.goodsName}
                          className="w-full mx-auto my-auto duration-100 transition-all hover:scale-110"
                        />
                      ) : (
                        <div className="bg-slate-200 animate-pulse w-30 h-30 lg:w-60 lg:h-60"></div>
                      )}
                    </div>
                    <div className="w-30 lg:w-60 mx-auto grid grid-cols-1 mt-4">
                      <p className="text-sm lg:text-base group-hover:font-lineseed keep-all overflow-hidden text-ellipsis whitespace-nowrap text-left font-lineseed text-blue-500 w-full overflow-x-hidden">
                        {good.brandName}
                      </p>
                      <p
                        className="text-base lg:base-lg group-hover:font-lineseed keep-all overflow-hidden text-ellipsis whitespace-nowrap text-left w-full overflow-x-hidden"
                        title={good.goodsName}
                      >
                        {good.goodsName}
                      </p>
                      <p className="text-base lg:base-lg text-left w-full overflow-x-hidden mt-3">
                        <span className="text-base text-rose-500">
                          {Number(good.realPrice).toLocaleString()}
                        </span>{" "}
                        P
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div>{loadMsg}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShopRecommend;
