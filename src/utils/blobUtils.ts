export const readAsDataURL = async (file: Blob): Promise<string> => {
  return new Promise(async (resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  });
};

export const dataURItoBlob = (dataURI: string, mimetype: string) => {
  const binary = atob(dataURI);
  const array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: mimetype });
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const anchor = document.createElement('a');
  document.body.appendChild(anchor);

  const objectUrl = URL.createObjectURL(blob);

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(objectUrl);
};
