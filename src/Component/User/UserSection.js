import React from "react";
import { Link } from "react-router-dom";
import UserInformation from "./UserInfomation";

function UserSection() {
  return (
    <div className="hidden xl:hidden grid-cols-5 gap-3 py-3">
      <div className="col-span-3 h-24 bg-blue-500 text-white p-2">
        가입프로모션
      </div>
      <div className="bg-blue-500 text-white p-2">
        <Link to="/board/write?boardId=B02">포인트신청</Link>
      </div>
      <div className="border p-2">
        <UserInformation />
      </div>
    </div>
  );
}

export default UserSection;
