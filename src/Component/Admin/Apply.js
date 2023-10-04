import React from "react";
import axios from "axios";

function Apply(props) {
  const updateData = async () => {
    if (props.applies.length > 0) {
      console.log(props.user.accessToken);
      let data = {
        protoList: [
          {
            protoName: "a",
            protoPhone: "b",
            protoPoint: 0,
            uid: "asdjfklasdjlf",
          },
        ],
      };
      console.log(data);
      await axios
        .post("/api/v1/user/proto", data, {
          headers: { Authorization: props.user.accessToken },
        })
        .then(res => {
          console.log(res);
        })
        .catch(e => {
          console.log(e);
        });
    } else {
      alert("구 회원 리스트 불러오는 중 입니다");
    }
  };

  const getList = async () => {
    let listUrl = "/api/v1/shop/goods/list";
    const data = {
      page: 1,
      size: 20,
    };
    await axios
      .get(listUrl, {
        params: data,
        headers: { Authorization: props.user.accessToken },
      })
      .then(res => {
        console.log(res);
      })
      .catch(e => {
        console.log(e, "에러");
      });
  };
  return (
    <>
      {props.applies.length > 0
        ? "구 회원 목록 불러오기 완료"
        : "구 회원 목록 불러오는 중..."}
      <br />
      <br />
      <button
        className={`p-2 text-white ${
          props.applies.length > 0 ? "bg-blue-500" : "bg-stone-900"
        }`}
        disabled={props.applies.legnth === 0}
        onClick={e => {
          updateData();
        }}
      >
        {props.applies.length > 0
          ? "구 회원 목록 입력하기"
          : "잠시만 기다려 주세요"}
      </button>
      <br />
      <br />
      <button
        className={`p-2 text-white ${
          props.applies.length > 0 ? "bg-blue-500" : "bg-stone-900"
        }`}
        disabled={props.applies.legnth === 0}
        onClick={e => {
          getList();
        }}
      >
        테스트
      </button>
    </>
  );
}

export default Apply;
