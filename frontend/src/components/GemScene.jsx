import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls,
    Environment,
    ContactShadows,
    Float,
    PerspectiveCamera,
    Sparkles
} from '@react-three/drei';

const GemGeometry = ({ gemType = 'sapphire' }) => {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        // Gentle rotation
        if (meshRef.current) {
            meshRef.current.rotation.y = time * 0.2;
        }
    });

    // Material properties based on gem type
    const gemMaterials = {
        sapphire: {
            color: '#1e3a8a', // Royal Blue Sapphire
            attenuationColor: '#3b82f6',
            envColor: '#60a5fa'
        },
        ruby: {
            color: '#991b1b', // Pigeon Blood Ruby
            attenuationColor: '#dc2626',
            envColor: '#ef4444'
        }
    };

    const material = gemMaterials[gemType] || gemMaterials.sapphire;

    return (
        <Float
            speed={2}
            rotationIntensity={0.5}
            floatIntensity={0.5}
            floatingRange={[-0.1, 0.1]}
        >
            <mesh ref={meshRef} castShadow receiveShadow>
                {/* Icosahedron with detail 1 for smoother crystal shape */}
                <icosahedronGeometry args={[1.8, 1]} />
                <meshPhysicalMaterial
                    color={material.color}
                    roughness={0.05}
                    metalness={0.1}
                    transmission={0.9}
                    thickness={2.5}
                    ior={1.76} // Index of refraction for corundum (sapphire/ruby)
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    envMapIntensity={2}
                    toneMapped={false}
                    attenuationDistance={0.5}
                    attenuationColor={material.attenuationColor}
                />
            </mesh>
            {/* Add sparkles for gem effect */}
            <Sparkles
                count={50}
                scale={3}
                size={2}
                speed={0.3}
                opacity={0.6}
                color={material.envColor}
            />
        </Float>
    );
};

const GemScene = ({ gemType = 'sapphire' }) => {
    // Lighting color based on gem type
    const lightColor = gemType === 'ruby' ? '#dc2626' : '#3b82f6';

    return (
        <div className="gem-canvas-container" style={{ width: '100%', height: '100%', minHeight: '200px' }}>
            <Canvas shadows dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />

                <ambientLight intensity={0.6} />
                <spotLight
                    position={[10, 10, 10]}
                    angle={0.2}
                    penumbra={1}
                    intensity={2.5}
                    castShadow
                    color="#ffffff"
                />
                <pointLight position={[-10, -10, -10]} intensity={1.8} color={lightColor} />
                <pointLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />

                <GemGeometry gemType={gemType} />

                <ContactShadows
                    position={[0, -2.5, 0]}
                    opacity={0.3}
                    scale={10}
                    blur={2.5}
                    far={4}
                    color="#000000"
                />

                {/* Studio lighting environment */}
                <Environment preset="city" />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
        </div>
    );
};

export default GemScene;
