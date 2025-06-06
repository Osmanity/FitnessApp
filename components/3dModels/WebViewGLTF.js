import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>GLTF Avatar</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
        }
        #container {
            width: 100vw;
            height: 100vh;
            position: relative;
        }
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 18px;
            z-index: 100;
        }
        #error {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ff6b6b;
            font-size: 16px;
            text-align: center;
            z-index: 100;
            display: none;
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="loading">Laddar fallback-avatar...</div>
        <div id="error">
            <p>Demo-robot kunde inte laddas</p>
            <p>Visar fallback-avatar istället</p>
        </div>
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/GLTFLoader.js"></script>
    <script>
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('container').appendChild(renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);
        
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x95a5a6, 
            transparent: true, 
            opacity: 0.3 
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1.5;
        ground.receiveShadow = true;
        scene.add(ground);
        
        // Camera position
        camera.position.set(0, 1, 4);
        camera.lookAt(0, 0.5, 0);
        
        let model = null;
        let mixer = null;
        
        // Create fallback avatar function
        function createFallbackAvatar() {
            const group = new THREE.Group();
            
            // Head
            const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
            const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.5;
            head.castShadow = true;
            group.add(head);
            
            // Body
            const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
            const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x4ecdc4 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.3;
            body.castShadow = true;
            group.add(body);
            
            // Arms
            const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
            const armMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
            
            const leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(-0.6, 0.5, 0);
            leftArm.rotation.z = 0.3;
            leftArm.castShadow = true;
            group.add(leftArm);
            
            const rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(0.6, 0.5, 0);
            rightArm.rotation.z = -0.3;
            rightArm.castShadow = true;
            group.add(rightArm);
            
            // Legs
            const legGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1, 8);
            const legMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
            
            const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(-0.2, -0.8, 0);
            leftLeg.castShadow = true;
            group.add(leftLeg);
            
            const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(0.2, -0.8, 0);
            rightLeg.castShadow = true;
            group.add(rightLeg);
            
            return group;
        }
        
        // Try to load GLTF model
        const loader = new THREE.GLTFLoader();
        
        // NOTE: WebView cannot access local files directly from the app bundle
        // To load John-Rigged.glb, we would need to:
        // 1. Convert it to base64 and embed it, or
        // 2. Serve it from a local HTTP server, or  
        // 3. Upload it to a CDN/cloud storage
        // For now, showing fallback avatar quickly
        
        // Show fallback avatar after short delay instead of trying to load external model
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            model = createFallbackAvatar();
            scene.add(model);
        }, 1000); // Show fallback after just 1 second
        
        // Optional: Try demo model in background (commented out to avoid hanging)
        /*
        const modelUrls = [
            'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb'
        ];
        
        let currentUrlIndex = 0;
        
        function tryLoadModel() {
            if (currentUrlIndex >= modelUrls.length) {
                // All URLs failed, use fallback
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'block';
                
                setTimeout(() => {
                    document.getElementById('error').style.display = 'none';
                    model = createFallbackAvatar();
                    scene.add(model);
                }, 1500); // Reduced from 2000ms to 1500ms
                return;
            }
            
            const url = modelUrls[currentUrlIndex];
            console.log('Trying to load:', url);
            
            // Set a timeout for loading
            const loadTimeout = setTimeout(() => {
                console.log('Loading timeout for:', url);
                currentUrlIndex++;
                tryLoadModel();
            }, 2000); // Reduced to 2 second timeout
            
            loader.load(
                url,
                function(gltf) {
                    // Success!
                    clearTimeout(loadTimeout);
                    document.getElementById('loading').style.display = 'none';
                    
                    // Remove fallback if it exists
                    if (model) {
                        scene.remove(model);
                    }
                    
                    model = gltf.scene;
                    model.scale.set(1, 1, 1);
                    model.position.set(0, -1, 0);
                    
                    // Enable shadows
                    model.traverse(function(child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    scene.add(model);
                    
                    // Setup animations if available
                    if (gltf.animations && gltf.animations.length > 0) {
                        mixer = new THREE.AnimationMixer(model);
                        const action = mixer.clipAction(gltf.animations[0]);
                        action.play();
                    }
                    
                    console.log('Model loaded successfully:', url);
                },
                function(progress) {
                    // Loading progress
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    document.getElementById('loading').textContent = 'Laddar demo-robot... ' + percent + '%';
                },
                function(error) {
                    // Error loading this URL, try next
                    clearTimeout(loadTimeout);
                    console.log('Failed to load:', url, error);
                    currentUrlIndex++;
                    tryLoadModel();
                }
            );
        }
        
        // Start loading (commented out for now)
        // tryLoadModel();
        */
        
        // Animation loop
        const clock = new THREE.Clock();
        
        function animate() {
            requestAnimationFrame(animate);
            
            const delta = clock.getDelta();
            
            if (mixer) {
                mixer.update(delta);
            }
            
            if (model) {
                // Gentle rotation
                model.rotation.y += 0.005;
                
                // Gentle floating if it's the fallback avatar
                if (!mixer) {
                    model.position.y = Math.sin(Date.now() * 0.002) * 0.1 - 1;
                }
            }
            
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Touch controls for mobile
        let isRotating = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        renderer.domElement.addEventListener('touchstart', (e) => {
            isRotating = true;
            previousMousePosition.x = e.touches[0].clientX;
            previousMousePosition.y = e.touches[0].clientY;
        });
        
        renderer.domElement.addEventListener('touchmove', (e) => {
            if (isRotating && model) {
                const deltaMove = {
                    x: e.touches[0].clientX - previousMousePosition.x,
                    y: e.touches[0].clientY - previousMousePosition.y
                };
                
                model.rotation.y += deltaMove.x * 0.01;
                model.rotation.x += deltaMove.y * 0.01;
                
                previousMousePosition.x = e.touches[0].clientX;
                previousMousePosition.y = e.touches[0].clientY;
            }
        });
        
        renderer.domElement.addEventListener('touchend', () => {
            isRotating = false;
        });
    </script>
</body>
</html>
`;

export default function WebViewGLTF() {
  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
}); 