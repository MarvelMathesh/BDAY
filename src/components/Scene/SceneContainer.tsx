import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { Suspense, useEffect, useRef } from "react";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Fireworks } from "../Fireworks"; // Verify import path later
import { AnimatedScene } from "./AnimatedScene";
import { useExperience } from "../../context/ExperienceContext";
import {
    ORBIT_TARGET, ORBIT_INITIAL_AZIMUTH, ORBIT_INITIAL_HEIGHT, ORBIT_INITIAL_RADIUS,
    ORBIT_MIN_DISTANCE, ORBIT_MAX_DISTANCE, ORBIT_MIN_POLAR, ORBIT_MAX_POLAR
} from "../../config/constants";

function ConfiguredOrbitControls() {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const camera = useThree((state) => state.camera);
    const { isMobile } = useExperience();
    const viewport = useThree((state) => state.viewport);

    useEffect(() => {
        // Dynamically adjust radius based on aspect ratio
        // If viewport.aspect < 1 (Portrait), we need to be further away to fit the Cake width
        const isPortrait = viewport.aspect < 1;
        const targetRadius = isPortrait ? ORBIT_INITIAL_RADIUS * 1.8 : ORBIT_INITIAL_RADIUS; // Zoom out in portrait/mobile
        const targetHeight = isPortrait ? ORBIT_INITIAL_HEIGHT * 1.2 : ORBIT_INITIAL_HEIGHT;

        const offset = new Vector3(
            Math.sin(ORBIT_INITIAL_AZIMUTH) * targetRadius,
            targetHeight,
            Math.cos(ORBIT_INITIAL_AZIMUTH) * targetRadius
        );

        const cameraPosition = ORBIT_TARGET.clone().add(offset);
        camera.position.copy(cameraPosition);
        camera.lookAt(ORBIT_TARGET);

        const controls = controlsRef.current;
        if (controls) {
            controls.target.copy(ORBIT_TARGET);
            // Also adjust limits for mobile so they can't zoom in too close and lose context
            controls.minDistance = isPortrait ? ORBIT_MIN_DISTANCE * 1.5 : ORBIT_MIN_DISTANCE;
            controls.maxDistance = isPortrait ? ORBIT_MAX_DISTANCE * 1.2 : ORBIT_MAX_DISTANCE;
            controls.update();
        }
    }, [camera, isMobile, viewport.aspect]);

    return (
        <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={ORBIT_MIN_DISTANCE}
            maxDistance={ORBIT_MAX_DISTANCE}
            minPolarAngle={ORBIT_MIN_POLAR}
            maxPolarAngle={ORBIT_MAX_POLAR}
        />
    );
}

function EnvironmentController() {
    const { environmentProgress } = useExperience();
    const scene = useThree((state) => state.scene);

    useEffect(() => {
        if ("backgroundIntensity" in scene) {
            (scene as any).backgroundIntensity = 0.05 * environmentProgress;
        }
    }, [scene, environmentProgress]);

    return (
        <>
            <ambientLight intensity={(1 - environmentProgress) * 0.8} />
            <directionalLight intensity={0.5} position={[2, 10, 0]} color={[1, 0.9, 0.95]} />
            <Environment
                files={["/shanghai_bund_4k.hdr"]}
                backgroundRotation={[0, 3.3, 0]}
                environmentRotation={[0, 3.3, 0]}
                background
                environmentIntensity={0.1 * environmentProgress}
                backgroundIntensity={0.05 * environmentProgress}
            />
        </>
    );
}

export function SceneContainer() {
    const { fireworksActive } = useExperience();

    return (
        <Canvas
            gl={{ alpha: true }}
            style={{
                background: "transparent",
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1
            }}
            onCreated={({ gl }) => {
                gl.setClearColor("#000000", 0);
            }}
        >
            <Suspense fallback={null}>
                <AnimatedScene />
                <EnvironmentController />
                <Fireworks isActive={fireworksActive} origin={[0, 10, 0]} />
                <ConfiguredOrbitControls />
                <EffectComposer enabled={true}>
                    <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    <Noise opacity={0.025} />
                </EffectComposer>
            </Suspense>
        </Canvas>
    );
}
