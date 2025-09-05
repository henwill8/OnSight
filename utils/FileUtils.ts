import { lookup } from "react-native-mime-types";

/**
 * Determines the file type (extension and MIME type) from a given URI.
 *
 * @param uri The URI of the file.
 * @returns An object containing the file's extension and MIME type.
 */
export const getFileType = (uri: string): { extension: string; mimeType: string } => {
  const mimeType = lookup(uri) || "application/octet-stream";
  const extension = mimeType.split("/")[1] || "bin";

  return { extension, mimeType };
};