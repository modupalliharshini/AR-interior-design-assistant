export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  model3D: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  colors: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  flipkartUrl?: string;
}

export interface ARSession {
  isActive: boolean;
  hasFloorDetection: boolean;
  placedObjects: PlacedObject[];
}

export interface PlacedObject {
  id: string;
  productId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
}