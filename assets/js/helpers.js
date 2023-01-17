export const mockWithVideo = (path) => {
  navigator.mediaDevices.getUserMedia = () => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.setAttribute("src", path);
      video.setAttribute("loop", "");

      video.oncanplay = () => {
        video.play();
        resolve(video.captureStream());
      };
    });
  };
};
