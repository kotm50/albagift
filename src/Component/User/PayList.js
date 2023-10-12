import React, { useState } from "react";
import PayModify from "./PayModify";

function PayList(props) {
  const [edit, setEdit] = useState(false);
  return (
    <>
      <div className="text-center p-1">{props.doc.intvDate}</div>
      <div className="text-center p-1">
        {props.doc.intvTime} : {props.doc.intvMin}
      </div>
      <div
        className={`text-center p-1 ${
          props.doc.status === "Y"
            ? "text-green-500"
            : props.doc.status === "N"
            ? "text-rose-500"
            : null
        }`}
      >
        {props.doc.status === "S"
          ? "심사중"
          : props.doc.status === "Y"
          ? "지급완료"
          : props.doc.status === "N"
          ? "지급불가"
          : null}
      </div>
      <div className="text-center col-span-2 p-1">
        {props.doc.status === "S" ? "현재 심사중 입니다." : props.doc.result}
      </div>
      {props.doc.status === "S" ? (
        <>
          <div className="text-center">
            <button
              className="bg-green-500 py-1 px-4 hover:bg-green-700 text-center text-white"
              onClick={e => setEdit(!edit)}
            >
              {!edit ? "면접시간수정" : "수정취소하기"}
            </button>
          </div>
          <div className="text-center">
            <button className=" border border-rose-500 text-rose-500 hover:border-rose-700 hover:text-rose-700 hover:bg-rose-100 py-1 px-4">
              지급신청취소
            </button>
          </div>
        </>
      ) : (
        <div className="col-span-2 text-center">
          지급이 {props.doc.status === "N" ? "불가처리" : "완료"}된 내역은
          수정이 불가능 합니다
        </div>
      )}
      {edit && <PayModify doc={props.doc} getList={props.getList} />}
    </>
  );
}

export default PayList;
