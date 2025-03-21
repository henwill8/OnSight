import { lookup } from "react-native-mime-types";

export const getFileType = (uri: string): { extension: string; mimeType: string } => {
  const mimeType = lookup(uri) || "application/octet-stream";
  const extension = mimeType.split("/")[1] || "bin";

  return { extension, mimeType };
};