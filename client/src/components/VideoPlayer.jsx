import React, { useRef, useState, useEffect } from 'react';

export default function VideoPlayer() {
  const videoContainerRef = useRef(null);
  const videoRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const previewImgRef = useRef(null);
  const thumbnailImgRef = useRef(null);
  const volumeSliderRef = useRef(null);
  const currentTimeRef = useRef(null);
  const totalTimeRef = useRef(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [wasPaused, setWasPaused] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volumeLevel, setVolumeLevel] = useState('high');
  const [isPaused, setIsPaused] = useState(true);

  const videoUrl = "https://xn----8sbbdcswqh2clm4frcf.xn--p1ai/Video.mp4";

  useEffect(() => {
    const video = videoRef.current;
    const handlePlay = () => setIsPaused(false);
    const handlePause = () => setIsPaused(true);
    const handleLoadedData = () => {
      totalTimeRef.current.textContent = formatDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      currentTimeRef.current.textContent = formatDuration(video.currentTime);
      const percent = video.currentTime / video.duration;
      timelineContainerRef.current.style.setProperty('--progress-position', percent);
    };

    const handleVolumeChange = () => {
      const volume = video.volume;
      volumeSliderRef.current.value = volume;
      setVolumeLevel(video.muted || volume === 0 ? 'muted' : volume >= 0.5 ? 'high' : 'low');
    };
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  const formatDuration = (time) => {
    const leadingZeroFormatter = new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2 });
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    if (hours === 0) {
      return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
    } else {
      return `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`;
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      setIsPaused(false);  
      video.play();
    } else {
      setIsPaused(true);  
      video.pause();
    }
  };

  const toggleFullScreenMode = () => {
    if (document.fullscreenElement == null) {
      videoContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleTheaterMode = () => {
    videoContainerRef.current.classList.toggle('theater');
  };

  const toggleMiniPlayerMode = () => {
    const video = videoRef.current;
    if (videoContainerRef.current.classList.contains('mini-player')) {
      document.exitPictureInPicture();
    } else {
      video.requestPictureInPicture();
    }
  };

  const changePlaybackSpeed = () => {
    const video = videoRef.current;
    let newPlaybackRate = video.playbackRate + 0.25;
    if (newPlaybackRate > 2) newPlaybackRate = 0.25;
    video.playbackRate = newPlaybackRate;
    setPlaybackSpeed(newPlaybackRate);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
  };

  const handleVolumeInputChange = (e) => {
    const video = videoRef.current;
    video.volume = e.target.value;
    video.muted = e.target.value === 0;
  };

  const handleTimelineUpdate = (e) => {
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
    const previewImgNumber = Math.max(1, Math.floor((percent * videoRef.current.duration) / 10));
    const previewImgSrc = `/previewImgs/thumbnail-${previewImgNumber}.jpg`;

    console.log(previewImgSrc);

    previewImgRef.current.src = previewImgSrc;
    timelineContainerRef.current.style.setProperty('--preview-position', percent);

    if (isScrubbing) {
      e.preventDefault();
      thumbnailImgRef.current.src = previewImgSrc;
      timelineContainerRef.current.style.setProperty('--progress-position', percent);
    }
  };

  const toggleScrubbing = (e) => {
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max(0, e.clientX - rect.x), rect.width) / rect.width;
    const isScrubbing = (e.buttons & 1) === 1;
    setIsScrubbing(isScrubbing);
    videoContainerRef.current.classList.toggle('scrubbing', isScrubbing);

    if (isScrubbing) {
      setWasPaused(videoRef.current.paused);
      videoRef.current.pause();
    } else {
      videoRef.current.currentTime = percent * videoRef.current.duration;
      if (!wasPaused) videoRef.current.play();
    }

    handleTimelineUpdate(e);
  };

  return (
    <div ref={videoContainerRef} className="video-container paused" data-volume-level={volumeLevel}>
      <img ref={thumbnailImgRef} className="thumbnail-img" src="" alt="" />
      <div className="video-controls-container">
        <div
          ref={timelineContainerRef}
          className="timeline-container"
          onMouseMove={handleTimelineUpdate}
          onMouseDown={toggleScrubbing}
          onMouseUp={toggleScrubbing}
        >
          <div className="timeline">
            <img ref={previewImgRef} className="preview-img" src="" alt="" />
            <div className="thumb-indicator"></div>
          </div>
        </div>
        <div className="controls">
          <button className="play-pause-btn" onClick={togglePlay}>
            {isPaused ? (
              <svg className="play-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
              </svg>
            ) : (
              <svg className="pause-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
              </svg>
            )}
          </button>
          <div className="volume-container">
            <button className="mute-btn" onClick={toggleMute}>
              {volumeLevel === 'high' ? (
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M14,3.23V20.77L7,15.54H3V8.46H7M16.5,12A4.5,4.5 0 0,0 14,8.65V15.35A4.5,4.5 0 0,0 16.5,12M14,3.23V20.77L7,15.54H3V8.46H7M19,12A7,7 0 0,0 16.5,4.5V19.5A7,7 0 0,0 19,12Z" />
                </svg>
              ) : volumeLevel === 'low' ? (
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M14,3.23V20.77L7,15.54H3V8.46H7M16.5,12A4.5,4.5 0 0,0 14,8.65V15.35A4.5,4.5 0 0,0 16.5,12M19,12A7,7 0 0,0 16.5,4.5V19.5A7,7 0 0,0 19,12Z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M14,3.23V20.77L7,15.54H3V8.46H7M16.5,12A4.5,4.5 0 0,0 14,8.65V15.35A4.5,4.5 0 0,0 16.5,12Z" />
                </svg>
              )}
            </button>
            <input
              ref={volumeSliderRef}
              className="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              defaultValue="1"
              onInput={handleVolumeInputChange}
            />
          </div>
          <div className="duration-container">
            <div ref={currentTimeRef} className="current-time">0:00</div>
            <div className="total-time"> / </div>
            <div ref={totalTimeRef} className="total-time">0:00</div>
          </div>
          <button className="speed-btn" onClick={changePlaybackSpeed}>
            {playbackSpeed}x
          </button>
          <button className="mini-player-btn" onClick={toggleMiniPlayerMode}>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 13H13V19H19M19 3H5C3.89 3 3 3.89 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.89 20.1 3 19 3Z" />
            </svg>
          </button>
          <button className="theater-btn" onClick={toggleTheaterMode}>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M4,20H14V18H4V20M4,14H20V12H4V14M4,6V8H20V6H4Z" />
            </svg>
          </button>
          <button className="full-screen-btn" onClick={toggleFullScreenMode}>
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M4,4H9V2H4A2,2 0 0,0 2,4V9H4V4M20,4H15V2H20A2,2 0 0,1 22,4V9H20V4M20,20H15V22H20A2,2 0 0,0 22,20V15H20V20M4,15H2V20A2,2 0 0,0 4,22H9V20H4V15Z" />
            </svg>
          </button>
        </div>
      </div>
      <video ref={videoRef} src={videoUrl} onClick={togglePlay}></video>
    </div>
  );
}
