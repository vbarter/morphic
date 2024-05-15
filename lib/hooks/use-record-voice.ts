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
    if (mediaRecorder) {
      (mediaRecorder as MediaRecorder).start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      (mediaRecorder as MediaRecorder).stop();
      setIsRecording(false);
    }
  };

  const getText = async (base64data: BlobToBase64Callback) => {
    try {
      console.log("call speech to text")
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
      console.log("text", text)
      setText(text);
      const search_button = document.getElementById('search-submit') as HTMLButtonElement;
      search_button.value = text
      search_button.click()
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

  const handleClick = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
      if (buttonRef.current) {
        buttonRef.current.focus();
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
