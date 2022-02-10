// import "./facerecognition.css";
import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";



const FaceRecognition = () => {
  const [initializing, setInitializing] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();
  const videoWidth = 640;
  const videoHeight = 480;

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      console.log(MODEL_URL);
      setInitializing(true);
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(startVideo);
      // setReady(true);
    }
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.getUserMedia(
      {
        video: {},
      },
      (stream) => (videoRef.current.srcObject = stream),
      (err)=>console.log(err)
    )
  }

  const handleVideoOnPlay=()=>{
    setInterval(async()=>{
        if(initializing){
            setInitializing(false);
        }
        canvasRef.current.innerHTML=faceapi.createCanvasFromMedia(videoRef.current);
        const displaySize={
            width:videoWidth,
            height:videoHeight
        }
        const detection=await faceapi.detectAllFaces(videoRef.current,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizedDetections=faceapi.resizeResults(detection,displaySize);
        canvasRef.current.getContext('2d').clearRect(0,0,videoWidth,videoHeight);
        faceapi.draw.drawDetections(canvasRef.current,resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvasRef.current,resizedDetections);
        faceapi.draw.drawFaceExpressions(canvasRef.current,resizedDetections  )
        console.log(detection);
    },100)
}

  const [ready, setReady]= useState(false)

  return (
    <div>
      <span>{initializing ? "Initializing" : "Ready"}</span>
      <video
        ref={videoRef}
        autoPlay
        muted
        height={videoHeight}
        width={videoWidth}
        onPlay={handleVideoOnPlay}
      />
      <canvas className="canvas" ref={canvasRef} />
    </div>
  );
};

export default FaceRecognition;
