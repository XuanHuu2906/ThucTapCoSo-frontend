export const downloadFile = async (url: string, fileName: string) => {
  if (!url) return;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
};
