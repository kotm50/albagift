import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

import queryString from "query-string";
import Loading from "../Layout/Loading";
import axiosInstance from "../../Api/axiosInstance";

function Certification() {
  const location = useLocation();

  const parsed = queryString.parse(location.search);
  const token_version_id = parsed.token_version_id || "";
  const enc_data = parsed.enc_data || "";
  const integrity_value = parsed.integrity_value || "";

  useEffect(() => {
    if (integrity_value === "" && enc_data === "" && token_version_id === "") {
      getData();
    } else {
      doCertification();
    }
    //eslint-disable-next-line
  }, [location]);

  const autoSubmit = (t, e, i) => {
    const formElement = document.getElementById("cert");
    if (formElement) {
      // 폼 엘리먼트를 찾았을 때만 폼 제출
      formElement.token_version_id.value = t;
      formElement.enc_data.value = e;
      formElement.integrity_value.value = i;
      formElement.submit();
    } else {
      console.error("폼 엘리먼트를 찾을 수 없습니다.");
      // 폼 엘리먼트를 찾을 수 없는 경우에 대한 처리 추가 가능
    }
  };

  const getData = async () => {
    await axiosInstance
      .post("/api/v1/common/nice/sec/req")
      .then(res => {
        console.log(res);
        autoSubmit(
          res.data.tokenVersionId,
          res.data.encData,
          res.data.integrityValue
        );
      })
      .catch(e => {
        alert("오류가 발생했습니다 관리자에게 문의해 주세요", e);
        window.opener.parentCallback({});
        window.close();
      });
  };
  const doCertification = async () => {
    const data = {
      tokenVersionId: token_version_id,
      encData: enc_data,
      integrityValue: integrity_value,
    };

    window.opener.parentCallback(data);
    window.close();
  };
  return (
    <div>
      <form
        id="cert"
        action="https://nice.checkplus.co.kr/CheckPlusSafeModel/service.cb"
      >
        <input type="hidden" id="m" name="m" value="service" />
        <input
          type="hidden"
          id="token_version_id"
          name="token_version_id"
          value=""
        />
        <input type="hidden" id="enc_data" name="enc_data" value="" />
        <input
          type="hidden"
          id="integrity_value"
          name="integrity_value"
          value=""
        />
      </form>
      <div className="popupArea">
        <Loading />
      </div>
    </div>
  );
}

export default Certification;
