import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

const GltfModel = ({ scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], autoRotate = true }) => {
  const ref = useRef();
  const [hovered, hover] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Use a reliable demo model instead of local asset for now
  const modelUrl = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';
  
  let scene = null;
  
  try {
    const gltf = useGLTF(modelUrl);
    scene = gltf.scene;
    
    useEffect(() => {
      if (scene) {
        setModelLoaded(true);
        setError(null);
      }
    }, [scene]);
    
  } catch (err) {
    console.warn('GLTF loading error (handled):', err.message);
    setError(err);
    setModelLoaded(false);
  }

  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => {
    if (ref.current && autoRotate && modelLoaded) {
      try {
        ref.current.rotation.y += 0.005; // Slower rotation to reduce load
      } catch (err) {
        // Silently handle rotation errors
      }
    }
  });

  // If error or no scene, render a simple fallback
  if (error || !scene || !modelLoaded) {
    return (
      <mesh 
        ref={ref} 
        position={position} 
        rotation={rotation} 
        scale={hovered ? scale * 1.05 : scale}
        onPointerOver={(event) => {
          event.stopPropagation();
          hover(true);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          hover(false);
        }}
      >
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial 
          color={hovered ? "#ff6b6b" : "#4ecdc4"} 
          transparent={true}
          opacity={0.8}
        />
      </mesh>
    );
  }

  // Clone the scene to avoid WeakMap issues
  const clonedScene = scene.clone();

  return (
    <primitive
      ref={ref}
      object={clonedScene}
      position={position}
      rotation={rotation}
      scale={hovered ? scale * 1.05 : scale}
      onPointerOver={(event) => {
        event.stopPropagation();
        hover(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        hover(false);
      }}
    />
  );
};

// Preload the model to reduce loading time
useGLTF.preload('https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb');

export default GltfModel; 