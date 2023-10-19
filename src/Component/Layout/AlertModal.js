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
  const sanitizer = dompurify.sanitize;
  return (
    <div id="alertmodal" className="max-w-screen p-4 bg-white border rounded">
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
  );
}

export default AlertModal;
