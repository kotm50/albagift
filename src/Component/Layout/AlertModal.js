import { useEffect, useRef } from "react";
import dompurify from "dompurify";

function AlertModal(props) {
  const confirmRef = useRef();
  const alertRef = useRef();
  useEffect(() => {
    if (confirmRef.current) {
      confirmRef.current.focus();
    }
    if (alertRef.current) {
      alertRef.current.focus();
    }
  }, []);
  useEffect(() => {
    const handleBack = event => {
      props.onClose(); // props.onClose()를 실행하여 부모 컴포넌트의 onClose 함수를 호출합니다.
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack); // 컴포넌트가 언마운트될 때 이벤트 리스너를 정리합니다.
    };
  }, [props]);
  const sanitizer = dompurify.sanitize;
  const modalClose = () => {
    if (props.type === "alert") {
      props.doIt();
    } else {
      props.doNot();
    }
    props.onClose(); // props.onClose()를 실행하여 부모 컴포넌트의 onClose 함수를 호출합니다.
  };
  useEffect(() => {
    const handleKeyDown = event => {
      console.log(event.key);
      if (event.key === "Escape") {
        modalClose();
      }
    };

    // keydown 이벤트 리스너를 추가합니다.
    window.addEventListener("keydown", handleKeyDown);

    // 컴포넌트 언마운트 시 이벤트 리스너를 제거합니다.
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    //eslint-disable-next-line
  }, []);
  return (
    <>
      <div
        id="alertmodal"
        className="relative max-w-screen p-4 bg-white border rounded"
        style={{ zIndex: 9999999999 }}
      >
        <div
          className={`px-4 py-10 bg-white border grid grid-cols-1 gap-y-3 ${
            props.type === "alert" ? "border-gray-200" : "border-sky-200"
          }`}
        >
          <h1
            className={`font-neoextra text-lg text-center ${
              props.type === "alert" ? "text-rose-500" : "text-sky-500"
            }`}
          >
            {props.title}
          </h1>
          <p
            className="text-center"
            dangerouslySetInnerHTML={{
              __html: sanitizer(props.message).replace(/\n/g, "<br>"),
            }}
          />
          {props.type === "confirm" ? (
            <div className="flex justify-center gap-x-2">
              <button
                ref={confirmRef}
                onClick={() => {
                  if (props.doIt) props.doIt();
                  props.onClose();
                }}
                className="border border-sky-500 bg-sky-500 text-white px-4 py-2"
              >
                {props.yes}
              </button>
              <button
                onClick={() => {
                  if (props.doNot) props.doNot();
                  props.onClose();
                }}
                className="border border-gray-500 text-gray-500 px-4 py-2"
              >
                {props.no}
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                ref={alertRef}
                onClick={() => {
                  if (props.doIt) props.doIt(props.data);
                  props.onClose();
                }}
                className="border border-sky-500 bg-sky-500 text-white px-4 py-2"
              >
                {props.yes}
              </button>
            </div>
          )}
        </div>
      </div>
      <div
        className="fixed top-0 left-0 bottom-0 right-0 bg-white bg-opacity-50 z-50"
        onClick={() => modalClose()}
      ></div>
    </>
  );
}

export default AlertModal;
