import axios from "axios";
import { ossAPI } from "@/lib/api";

interface OssPresignResponse {
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  contentType: string;
  expireAt: number;
}

export async function uploadChatImageToOss(file: File) {
  const response = await ossAPI.getPresignedUploadUrl({
    fileName: file.name,
    contentType: file.type,
  });

  const payload: OssPresignResponse = response.data;
  await axios.put(payload.uploadUrl, file, {
    headers: {
      "Content-Type": payload.contentType,
    },
  });

  return payload.publicUrl;
}
