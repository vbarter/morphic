import { BlobToBase64Callback } from "../types/blob-to-base64-type";
import { blobToBase64 } from "../utils/blob-to-base64";
import { useEffect, useState, useRef } from "react";

export const useRecordVoice = () => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [text, setText] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);

  const chunks = useRef([]);

  const startRecording = () => {
    console.log(2232)
    if (mediaRecorder) {
      (mediaRecorder as MediaRecorder).start();
      console.log("开始le ")
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    console.log(323223)
    if (mediaRecorder) {
      (mediaRecorder as MediaRecorder).stop();
      console.log("结束了 ")
      setIsRecording(false);
    }
  };

  const getText = async (base64data: BlobToBase64Callback) => {
    try {
      const response = await fetch("/api/assistant/speech-to-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: base64data,
        }),
      }).then((res) => res.json());
      const { text } = response;
      console.log(text)
      setText(text);
    } catch (error) {
      console.log(error);
    }
  };

  const initialMediaRecorder = (stream: MediaStream) => {
    const mediaRecorder: MediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstart = () => {
      chunks.current = [];
    };

    mediaRecorder.ondataavailable = (ev: BlobEvent) => {
      chunks.current.push(ev.data as never);
    };

    mediaRecorder.onstop = () => {
      const audioBlob: Blob = new Blob(chunks.current, { type: "audio/wav" });
      blobToBase64(audioBlob, getText as unknown as BlobToBase64Callback); // Change the type of getText to unknown first
    };

    setMediaRecorder(mediaRecorder as MediaRecorder | null);
  };

  const handleClick = (inputRef: React.RefObject<HTMLInputElement>) => {
    console.log(1)
    if (!isRecording) {
      console.log(2)
      startRecording();
    } else {
      console.log(3)
      stopRecording();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initialMediaRecorder);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run only once on mount to get the media stream

  return { isRecording, handleClick, text };
};
