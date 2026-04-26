/**
 * Gem3DViewer.jsx — Loads and displays a GLB model with React Three Fiber.
 * Falls back to the generic GemScene icosahedron when no model URL is provided.
 */
import { Suspense, useRef, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Center, Float, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import GemScene from '../../../shared/components/GemScene';

/* ─── GLB model renderer ─── */
const GemModel = ({ url }) => {
    const { scene } = useGLTF(url);
    const ref = useRef();

    useFrame((_, delta) => {
        if (ref.current) ref.current.rotation.y += delta * 0.15;
    });

    return (
        <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.25}>
            <Center>
                <primitive ref={ref} object={scene} scale={2} />
            </Center>
        </Float>
    );
};

/* ─── Error boundary ─── */
class ViewerErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { failed: false }; }
    static getDerivedStateFromError() { return { failed: true }; }
    render() {
        if (this.state.failed) {
            return (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a14', gap: 8 }}>
                    <span style={{ fontSize: '2.5rem' }}>💎</span>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.75rem', color: '#9A9AAB' }}>3D preview unavailable</span>
                </div>
            );
        }
        return this.props.children;
    }
}

/* ─── Loading placeholder ─── */
const Loader = () => (
    <mesh>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial color="#E0DCD6" wireframe />
    </mesh>
);

/* ─── Main viewer ─── */
const Gem3DViewer = ({ modelUrl, style = {} }) => {
    // No model → fallback to generic gem scene
    if (!modelUrl) return <GemScene gemType="sapphire" />;

    return (
        <div style={{ width: '100%', height: '100%', minHeight: 320, borderRadius: 12, overflow: 'hidden', background: '#0a0a14', ...style }}>
            <ViewerErrorBoundary>
            <Canvas gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={40} />
                <color attach="background" args={['#0a0a14']} />

                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <directionalLight position={[-3, 2, -5]} intensity={0.6} color="#3b82f6" />
                <spotLight position={[0, 8, 0]} intensity={0.8} angle={0.3} penumbra={0.8} color="#C4892A" />

                <Suspense fallback={<Loader />}>
                    <GemModel url={modelUrl} />
                    <Environment preset="studio" environmentIntensity={0.7} />
                    <ContactShadows position={[0, -1.5, 0]} opacity={0.35} scale={8} blur={2} />
                </Suspense>

                <EffectComposer>
                    <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.5} intensity={0.3} />
                </EffectComposer>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={1}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
            </ViewerErrorBoundary>
        </div>
    );
};

export default Gem3DViewer;
