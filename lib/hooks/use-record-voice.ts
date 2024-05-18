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
    } catch (error) {
      console.log(error);
    }
  };

  const initialMediaRecorder = (stream: MediaStream) => {
    const mimeTypes = ["audio/webm", "video/mp4", "audio/wav"];
    let mediaRecorder: MediaRecorder = null as unknown as MediaRecorder;
    let choosenMimeType: string = "";
    for (let mimeType of mimeTypes) {
      try {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          choosenMimeType = mimeType;
          const options = { mimeType };
          mediaRecorder = new MediaRecorder(stream, options);
          // 进行录制等操作
          break
        }
      } catch (error) {
        console.error(`Error creating MediaRecorder with mimeType: ${mimeType}`, error);
      }
    }

    if (!mediaRecorder) {
      console.error("No suitable mimeType found for this device");
      return;
    }

    // const mediaRecorder: MediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstart = () => {
      console.log("mediaRecorder.onstart")
      chunks.current = [];
    };

    mediaRecorder.ondataavailable = (ev: BlobEvent) => {
      chunks.current.push(ev.data as never);
    };

    console.log("44")
    mediaRecorder.onstop = () => {
      const audioBlob: Blob = new Blob(chunks.current, { type: choosenMimeType });
      console.log("55")
      blobToBase64(audioBlob, getText as unknown as BlobToBase64Callback); // Change the type of getText to unknown first
    };

    setMediaRecorder(mediaRecorder as MediaRecorder | null);
  };

  const handleClick = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (!isRecording) {
      console.log("11")
      startRecording();
    } else {
      console.log("22")
      stopRecording();
      if (buttonRef.current) {
        buttonRef.current.focus();
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      chunks.current = [];
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initialMediaRecorder);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run only once on mount to get the media stream

  return { isRecording, handleClick, text };
};
