import React, { useRef, useEffect, useState } from 'react';
import { X, RotateCw, ZoomIn, ZoomOut, Camera, CheckCircle } from 'lucide-react';
import { Product } from '../types/product';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ARViewerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ARViewer: React.FC<ARViewerProps> = ({ isOpen, onClose, product }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const modelLoadedRef = useRef<boolean>(false);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [hasFloorDetected, setHasFloorDetected] = useState(false);
  const [placedObject, setPlacedObject] = useState<THREE.Object3D | null>(null);
  const [floorPlane, setFloorPlane] = useState<THREE.Mesh | null>(null);
  const [isPlaced, setIsPlaced] = useState(false);

  useEffect(() => {
    if (isOpen) initializeAR();
    else cleanup();
    return cleanup;
  }, [isOpen]);

  const initializeAR = async () => {
    try {
      modelLoadedRef.current = false;
      setIsPlaced(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setupThreeJS();
      setTimeout(startFloorScanning, 1000);
    } catch (error) {
      console.error('AR initialization failed:', error);
      alert('Please allow camera access to use AR.');
    }
  };

  const setupThreeJS = () => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    camera.position.set(0, 1.6, 2);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    animate();
  };

  const animate = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(animate);
  };

  const startFloorScanning = () => {
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((p) => {
        const np = p + Math.random() * 15 + 10;
        if (np >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setHasFloorDetected(true);
          createFloorPlane();
          if (product && !modelLoadedRef.current) {
            loadAndPlace3DModel();
          }
          return 100;
        }
        return np;
      });
    }, 300);
  };

  const createFloorPlane = () => {
    if (!sceneRef.current) return;
    const planeGeo = new THREE.PlaneGeometry(10, 10);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1.5;
    plane.receiveShadow = true;
    sceneRef.current.add(plane);
    setFloorPlane(plane);
  };

  const loadAndPlace3DModel = async () => {
    if (!sceneRef.current || !product || modelLoadedRef.current) return;
    modelLoadedRef.current = true;

    const loader = new GLTFLoader();
    try {
      const gltf = await loader.loadAsync(product.model3D);
      const model = gltf.scene;
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const scaleFactor = 2 / Math.max(size.x, size.y, size.z);
      model.scale.multiplyScalar(scaleFactor);

      box.setFromObject(model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center);
      model.position.y =
        (floorPlane?.position.y ?? -1.5) + (size.y * scaleFactor) / 2;
      model.position.z = -1.5;

      if (placedObject && sceneRef.current) {
        sceneRef.current.remove(placedObject);
      }

      sceneRef.current.add(model);
      setPlacedObject(model);
    } catch (err) {
      console.error('Error loading model:', err);
      alert('Could not load 3D model for this product.');
    }
  };

  const rotateObject = () =>
    placedObject && (placedObject.rotation.y += Math.PI / 4);
  const scaleObject = (f: number) =>
    placedObject && placedObject.scale.setScalar(placedObject.scale.x * f);
  const moveObject = (dir: 'forward' | 'backward' | 'left' | 'right') => {
    if (!placedObject) return;
    const d = 0.2;
    if (dir === 'forward') placedObject.position.z -= d;
    if (dir === 'backward') placedObject.position.z += d;
    if (dir === 'left') placedObject.position.x -= d;
    if (dir === 'right') placedObject.position.x += d;
  };

  // ✅ Freeze both object and camera feed when furniture is placed
  const handlePlaceFurniture = () => {
    setIsPlaced(true);

    // Stop camera stream and freeze background
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/png');

      // Pause and replace live feed with static frame
      video.pause();
      video.srcObject = null;
      video.style.background = `url(${imageData}) center/cover no-repeat`;
    }

    // Stop Three.js rendering updates
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  };

  const cleanup = () => {
    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    }
    rendererRef.current?.dispose();
    sceneRef.current?.clear();
    modelLoadedRef.current = false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Floor scanning overlay */}
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="bg-black/80 p-6 rounded-3xl text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse text-blue-400" />
            <p>Scanning room... {Math.round(scanProgress)}%</p>
          </div>
        </div>
      )}

      {/* ✅ Controls visible until placed */}
      {hasFloorDetected && placedObject && !isPlaced && (
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center space-y-4 text-white">
          <div className="flex space-x-3 justify-center">
            <button onClick={rotateObject} className="bg-white/20 p-4 rounded-full">
              <RotateCw />
            </button>
            <button onClick={() => scaleObject(1.2)} className="bg-white/20 p-4 rounded-full">
              <ZoomIn />
            </button>
            <button onClick={() => scaleObject(0.8)} className="bg-white/20 p-4 rounded-full">
              <ZoomOut />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div></div>
            <button onClick={() => moveObject('forward')} className="bg-white/20 p-3 rounded-lg">↑</button>
            <div></div>
            <button onClick={() => moveObject('left')} className="bg-white/20 p-3 rounded-lg">←</button>
            <div></div>
            <button onClick={() => moveObject('right')} className="bg-white/20 p-3 rounded-lg">→</button>
            <div></div>
            <button onClick={() => moveObject('backward')} className="bg-white/20 p-3 rounded-lg">↓</button>
            <div></div>
          </div>

          {/* ✅ Place Furniture button */}
          <button
            onClick={handlePlaceFurniture}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full flex items-center space-x-2 shadow-lg"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Place Furniture</span>
          </button>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/20 text-white p-3 rounded-full"
      >
        <X />
      </button>
    </div>
  );
};
