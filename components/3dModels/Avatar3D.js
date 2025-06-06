import React, { useState, useEffect, Suspense } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import GltfModel from './GltfModel';

const { width } = Dimensions.get('window');

const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4ecdc4" />
    <Text style={styles.loadingText}>Laddar 3D Avatar...</Text>
  </View>
);

const ErrorFallback = ({ error }) => (
  <View style={styles.errorContainer}>
    <MaterialCommunityIcons name="alert-circle" size={48} color="#ff6b6b" />
    <Text style={styles.errorText}>3D-fel upptäckt</Text>
    <Text style={styles.errorSubtext}>Använder fallback-läge</Text>
  </View>
);

const Simple3DAvatar = ({ autoRotate, enableControls }) => {
  const [rotationValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (autoRotate) {
      const startRotation = () => {
        Animated.loop(
          Animated.timing(rotationValue, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          })
        ).start();
      };
      startRotation();
    } else {
      rotationValue.stopAnimation();
    }
  }, [autoRotate, rotationValue]);

  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.simple3DContainer}>
      <Animated.View 
        style={[
          styles.avatarModel,
          autoRotate && { transform: [{ rotateY: rotation }] }
        ]}
      >
        {/* Avatar representation */}
        <View style={styles.avatarHead}>
          <MaterialCommunityIcons name="account-circle" size={60} color="#4ecdc4" />
        </View>
        <View style={styles.avatarBody}>
          <MaterialCommunityIcons name="human-handsup" size={80} color="#4ecdc4" />
        </View>
        <View style={styles.avatarShadow} />
      </Animated.View>
      
      {enableControls && (
        <View style={styles.controlsHint}>
          <Text style={styles.controlsText}>3D Avatar</Text>
          <Text style={styles.controlsSubtext}>Kompatibel version</Text>
        </View>
      )}
    </View>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('3D Avatar Error (handled):', error.message);
  }

  render() {
    if (this.state.hasError) {
      return <Simple3DAvatar {...this.props} />;
    }

    return this.props.children;
  }
}

const Real3DAvatar = ({ autoRotate, enableControls, scale, position }) => {
  return (
    <ErrorBoundary autoRotate={autoRotate} enableControls={enableControls}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        onCreated={(state) => {
          console.log('3D Canvas created successfully');
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: false // Reduce memory usage
        }}
        dpr={[1, 2]} // Limit pixel ratio for performance
      >
        <Suspense fallback={null}>
          {/* Simplified lighting setup */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          {/* Environment for better reflections */}
          <Environment preset="studio" />
          
          {/* 3D Avatar Model */}
          <GltfModel 
            scale={scale} 
            position={position}
            autoRotate={autoRotate}
          />
          
          {/* Ground shadow */}
          <ContactShadows 
            position={[0, -1.4, 0]} 
            opacity={0.3} 
            scale={8} 
            blur={1} 
            far={4} 
          />
          
          {/* Controls */}
          {enableControls && (
            <OrbitControls 
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              autoRotate={false}
              minDistance={3}
              maxDistance={8}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI - Math.PI / 6}
              dampingFactor={0.1}
              enableDamping={true}
            />
          )}
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
};

const Avatar3D = ({ 
  scale = 0.8, 
  position = [0, -1, 0],
  enableControls = true,
  autoRotate = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Give time for components to load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (hasError) {
    return (
      <Simple3DAvatar 
        autoRotate={autoRotate}
        enableControls={enableControls}
      />
    );
  }

  try {
    return (
      <Real3DAvatar 
        autoRotate={autoRotate}
        enableControls={enableControls}
        scale={scale}
        position={position}
      />
    );
  } catch (error) {
    console.warn('Avatar3D fallback triggered:', error.message);
    setHasError(true);
    return (
      <Simple3DAvatar 
        autoRotate={autoRotate}
        enableControls={enableControls}
      />
    );
  }
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  errorSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  simple3DContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  avatarModel: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarHead: {
    marginBottom: -10,
    zIndex: 2,
  },
  avatarBody: {
    zIndex: 1,
  },
  avatarShadow: {
    position: 'absolute',
    bottom: -20,
    width: 80,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 40,
    transform: [{ scaleX: 1.2 }],
  },
  controlsHint: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  controlsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  controlsSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default Avatar3D; 