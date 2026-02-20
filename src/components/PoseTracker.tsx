import React, { useEffect, useRef, useCallback } from 'react';
import { Pose, Results } from '@mediapipe/pose';
import { FaceMesh, Results as FaceResults } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
import { FACEMESH_TESSELATION } from '@mediapipe/face_mesh';

interface PoseTrackerProps {
  onResults: (results: Results) => void;
  onFaceResults?: (results: FaceResults) => void;
  active: boolean;
}

export const PoseTracker: React.FC<PoseTrackerProps> = ({ onResults, onFaceResults, active }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    if (!active) {
      cameraRef.current?.stop();
      return;
    }

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      onResults(results);
      draw(results, null);
    });

    faceMesh.onResults((results) => {
      onFaceResults?.(results);
      draw(null, results);
    });

    const draw = (poseResults: Results | null, faceResults: FaceResults | null) => {
      if (!canvasRef.current || !videoRef.current) return;
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      // We only clear if we have new data to draw or periodically
      // To keep both pose and face visible, we might need a more complex drawing loop
      // But for now, let's just draw what we have
      
      if (poseResults) {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (poseResults.poseLandmarks) {
          drawConnectors(canvasCtx, poseResults.poseLandmarks, POSE_CONNECTIONS, {
            color: '#10b981',
            lineWidth: 2,
          });
          drawLandmarks(canvasCtx, poseResults.poseLandmarks, {
            color: '#ffffff',
            lineWidth: 1,
            radius: 2,
          });
        }
        canvasCtx.restore();
      }

      if (faceResults && faceResults.multiFaceLandmarks) {
        canvasCtx.save();
        for (const landmarks of faceResults.multiFaceLandmarks) {
          drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {
            color: '#10b98144',
            lineWidth: 1,
          });
        }
        canvasCtx.restore();
      }
    };

    poseRef.current = pose;
    faceMeshRef.current = faceMesh;

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await pose.send({ image: videoRef.current });
            await faceMesh.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
      cameraRef.current = camera;
    }

    return () => {
      cameraRef.current?.stop();
      poseRef.current?.close();
      faceMeshRef.current?.close();
    };
  }, [active, onResults, onFaceResults]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover camera-feed opacity-40"
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover camera-feed z-10"
        width={640}
        height={480}
      />
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">Live Tracking Active (Pose + Face)</span>
      </div>
    </div>
  );
};
