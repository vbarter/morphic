import { BlobToBase64Callback } from "../types/blob-to-base64-type";

const blobToBase64 = (blob: Blob, callback: BlobToBase64Callback) => {
  const reader = new FileReader();
  reader.onload = function () {
    const base64data = (reader?.result as string)?.split(",")[1];
    callback(base64data);
  };
  reader.readAsDataURL(blob);
};

export { blobToBase64 };
