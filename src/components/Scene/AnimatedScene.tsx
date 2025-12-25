import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { Candle } from "../../models/candle";
import { Cake } from "../../models/cake";
import { Table } from "../../models/table";
import { PictureFrame } from "../../models/pictureFrame";
import { BirthdayCard } from "../../components/BirthdayCard";
import { useExperience } from "../../context/ExperienceContext";
import {
    CAKE_START_Y, CAKE_END_Y, CAKE_DESCENT_DURATION,
    TABLE_START_Z, TABLE_END_Z, TABLE_SLIDE_START, TABLE_SLIDE_DURATION,
    CANDLE_START_Y, CANDLE_END_Y, CANDLE_DROP_START, CANDLE_DROP_DURATION,
    TOTAL_ANIMATION_TIME, BACKGROUND_FADE_START, BACKGROUND_FADE_DURATION,
    BIRTHDAY_CARDS
} from "../../config/constants";

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function AnimatedScene() {
    const {
        isPlaying,
        setBackgroundOpacity,
        setEnvironmentProgress,
        setAnimationComplete,
        isCandleLit,
        activeCardId,
        toggleCard,
        micVolume
    } = useExperience();

    const cakeGroup = useRef<Group>(null);
    const tableGroup = useRef<Group>(null);
    const candleGroup = useRef<Group>(null);
    const animationStartRef = useRef<number | null>(null);
    const hasPrimedRef = useRef(false);
    const hasCompletedRef = useRef(false);

    // This useFrame logic is ported from the original App.tsx but simplified where possible
    useFrame(({ clock }) => {
        const cake = cakeGroup.current;
        const table = tableGroup.current;
        const candle = candleGroup.current;

        if (!cake || !table || !candle) return;

        // Initial setup (Prime)
        if (!hasPrimedRef.current) {
            cake.position.set(0, CAKE_START_Y, 0);
            table.position.set(0, 0, TABLE_START_Z);
            candle.position.set(0, CANDLE_START_Y, 0);
            candle.visible = false;
            hasPrimedRef.current = true;
        }

        if (!isPlaying) {
            // Reset if not playing
            animationStartRef.current = null;
            return;
        }

        if (hasCompletedRef.current) return;

        if (animationStartRef.current === null) {
            animationStartRef.current = clock.elapsedTime;
        }

        const elapsed = clock.elapsedTime - animationStartRef.current;
        const clampedElapsed = clamp(elapsed, 0, TOTAL_ANIMATION_TIME);

        // Cake Animation
        const cakeProgress = clamp(clampedElapsed / CAKE_DESCENT_DURATION, 0, 1);
        const cakeEase = easeOutCubic(cakeProgress);
        cake.position.y = lerp(CAKE_START_Y, CAKE_END_Y, cakeEase);
        cake.rotation.y = cakeEase * Math.PI * 2;

        // Table Animation
        let tableZ = TABLE_START_Z;
        if (clampedElapsed >= TABLE_SLIDE_START) {
            const tableProgress = clamp((clampedElapsed - TABLE_SLIDE_START) / TABLE_SLIDE_DURATION, 0, 1);
            const ease = easeOutCubic(tableProgress);
            tableZ = lerp(TABLE_START_Z, TABLE_END_Z, ease);
        }
        table.position.z = tableZ;

        // Candle Animation
        if (clampedElapsed >= CANDLE_DROP_START) {
            candle.visible = true;
            const candleProgress = clamp((clampedElapsed - CANDLE_DROP_START) / CANDLE_DROP_DURATION, 0, 1);
            const ease = easeOutCubic(candleProgress);
            candle.position.y = lerp(CANDLE_START_Y, CANDLE_END_Y, ease);
        }

        // Environment & Background Fade Logic
        if (clampedElapsed >= BACKGROUND_FADE_START) {
            const fadeProgress = clamp((clampedElapsed - BACKGROUND_FADE_START) / BACKGROUND_FADE_DURATION, 0, 1);
            const eased = easeOutCubic(fadeProgress);
            const opacity = 1 - eased;

            setBackgroundOpacity(opacity);
            setEnvironmentProgress(1 - opacity);
        }

        // Completion Check
        if (clampedElapsed >= TOTAL_ANIMATION_TIME) {
            hasCompletedRef.current = true;
            setAnimationComplete();

            // Force final state
            cake.position.set(0, CAKE_END_Y, 0);
            table.position.set(0, 0, TABLE_END_Z);
            candle.position.set(0, CANDLE_END_Y, 0);
            candle.visible = true;
            setBackgroundOpacity(0);
            setEnvironmentProgress(1);
        }
    });

    return (
        <>
            <group ref={tableGroup}>
                <Table />
                {/* Frames could be broken out too, but keeping inline for now */}
                <PictureFrame image="/frame2.jpg" position={[0, 0.735, 3]} rotation={[0, 5.6, 0]} scale={0.75} />
                <PictureFrame image="/frame3.jpg" position={[0, 0.735, -3]} rotation={[0, 4.0, 0]} scale={0.75} />
                <PictureFrame image="/frame4.jpg" position={[-1.5, 0.735, 2.5]} rotation={[0, 5.4, 0]} scale={0.75} />
                <PictureFrame image="/frame1.jpg" position={[-1.5, 0.735, -2.5]} rotation={[0, 4.2, 0]} scale={0.75} />

                {BIRTHDAY_CARDS.map((card) => (
                    <BirthdayCard
                        key={card.id}
                        id={card.id}
                        image={card.image}
                        tablePosition={card.position}
                        tableRotation={card.rotation}
                        isActive={activeCardId === card.id}
                        onToggle={toggleCard}
                    />
                ))}
            </group>

            <group ref={cakeGroup}>
                <Cake />
            </group>

            <group ref={candleGroup}>
                <Candle isLit={isCandleLit} micVolume={micVolume} scale={0.25} position={[0, 1.1, 0]} />
            </group>
        </>
    );
}
