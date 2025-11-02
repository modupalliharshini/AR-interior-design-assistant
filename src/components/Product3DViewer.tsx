import React, { useRef, useEffect } from 'react';
import { X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { Product } from '../types/product';
import * as THREE from 'three';

interface Product3DViewerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const Product3DViewer: React.FC<Product3DViewerProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      initializeThreeJS();
    }

    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product]);

  const initializeThreeJS = () => {
    if (!canvasRef.current || !product) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });

    renderer.setSize(600, 600);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-10, -10, -5);
    scene.add(fillLight);

    // Create product geometry
    createProductMesh(scene, product);

    // Camera positioning
    camera.position.set(3, 2, 5);
    camera.lookAt(0, 0, 0);

    // Store references
    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Start animation loop
    animate();
  };

  const createProductMesh = (scene: THREE.Scene, product: Product) => {
    let geometry: THREE.BufferGeometry;
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(product.colors[0]),
      shininess: 30,
    });

    switch (product.category) {
      case 'Sofas': {
        geometry = new THREE.BoxGeometry(2.2, 0.8, 1.6);
        const cushionGeo = new THREE.BoxGeometry(0.7, 0.15, 0.7);
        const cushionMat = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        for (let i = 0; i < 3; i++) {
          const cushion = new THREE.Mesh(cushionGeo, cushionMat);
          cushion.position.set(-0.7 + i * 0.7, 0.5, -0.3);
          scene.add(cushion);
        }
        break;
      }
      case 'Chairs': {
        geometry = new THREE.BoxGeometry(0.6, 0.05, 0.6);
        const backrest = new THREE.BoxGeometry(0.6, 0.8, 0.05);
        const backMesh = new THREE.Mesh(backrest, material);
        backMesh.position.set(0, 0.4, -0.275);
        scene.add(backMesh);

        const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
        const legPositions: [number, number, number][] = [
          [-0.25, -0.25, -0.25],
          [0.25, -0.25, -0.25],
          [-0.25, -0.25, 0.25],
          [0.25, -0.25, 0.25],
        ];
        legPositions.forEach((pos) => {
          const leg = new THREE.Mesh(legGeo, material);
          leg.position.set(pos[0], pos[1], pos[2]);
          scene.add(leg);
        });
        break;
      }
      case 'Lamps': {
        geometry = new THREE.CylinderGeometry(0.3, 0.1, 0.6, 16);
        const baseGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.1, 16);
        const base = new THREE.Mesh(baseGeo, material);
        base.position.y = -0.75;
        scene.add(base);

        const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2);
        const pole = new THREE.Mesh(poleGeo, material);
        pole.position.y = -0.1;
        scene.add(pole);
        break;
      }
      case 'Tables': {
        geometry = new THREE.BoxGeometry(1.2, 0.05, 0.6);
        const tableLegGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4);
        const tableLegPositions: [number, number, number][] = [
          [-0.55, -0.225, -0.25],
          [0.55, -0.225, -0.25],
          [-0.55, -0.225, 0.25],
          [0.55, -0.225, 0.25],
        ];
        tableLegPositions.forEach((pos) => {
          const leg = new THREE.Mesh(tableLegGeo, material);
          leg.position.set(pos[0], pos[1], pos[2]);
          scene.add(leg);
        });
        break;
      }
      case 'Beds': {
        geometry = new THREE.BoxGeometry(1.8, 0.3, 2.0);
        const headboardGeo = new THREE.BoxGeometry(1.8, 1.0, 0.1);
        const headboard = new THREE.Mesh(headboardGeo, material);
        headboard.position.set(0, 0.5, -0.95);
        scene.add(headboard);

        const mattressGeo = new THREE.BoxGeometry(1.7, 0.2, 1.9);
        const mattressMat = new THREE.MeshPhongMaterial({ color: 0xf5f5dc });
        const mattress = new THREE.Mesh(mattressGeo, mattressMat);
        mattress.position.y = 0.25;
        scene.add(mattress);
        break;
      }
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;

    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.1 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    floor.receiveShadow = true;
    scene.add(floor);
  };

  const animate = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(animate);
  };

  const rotateProduct = () => {
    if (meshRef.current) {
      meshRef.current.rotation.y += Math.PI / 4;
    }
  };

  const zoomCamera = (factor: number) => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(factor);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const cleanup = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
            <p className="text-gray-600">{product.category} - 3D View</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-2/3 p-6">
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-96 lg:h-[500px] block" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <button
                  onClick={rotateProduct}
                  className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="w-5 h-5 text-gray-700" />
                </button>

                <button
                  onClick={() => zoomCamera(0.9)}
                  className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-5 h-5 text-gray-700" />
                </button>

                <button
                  onClick={() => zoomCamera(1.1)}
                  className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 p-6 border-l bg-gray-50">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Product Details</h3>
                <p className="text-gray-600 text-sm">{product.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Dimensions</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Width: {product.dimensions.width}cm</div>
                  <div>Height: {product.dimensions.height}cm</div>
                  <div>Depth: {product.dimensions.depth}cm</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Available Colors</h4>
                <div className="flex space-x-2">
                  {product.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Price</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (product.flipkartUrl) {
                    window.open(product.flipkartUrl, '_blank');
                  }
                }}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200"
              >
                Buy on Flipkart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
