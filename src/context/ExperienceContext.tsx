import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { useMicInput } from "../hooks/useMicInput";

type ExperienceState = {
    isPlaying: boolean;
    hasStarted: boolean;
    isCandleLit: boolean;
    fireworksActive: boolean;
    activeCardId: string | null;
    backgroundOpacity: number;
    environmentProgress: number;
    isMobile: boolean;
    micVolume: number;
    micPermission: boolean;
};

type ExperienceActions = {
    startExperience: () => void;
    triggerInteraction: () => void;
    blowCandle: () => void;
    toggleCard: (id: string | null) => void;
    setBackgroundOpacity: (opacity: number) => void;
    setEnvironmentProgress: (progress: number) => void;
    setAnimationComplete: () => void;
    setScenePlaying: (playing: boolean) => void;
};

const ExperienceContext = createContext<(ExperienceState & ExperienceActions) | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
    const [hasStarted, setHasStarted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isCandleLit, setIsCandleLit] = useState(true);
    const [fireworksActive, setFireworksActive] = useState(false);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const [backgroundOpacity, setBackgroundOpacity] = useState(1);
    const [environmentProgress, setEnvironmentProgress] = useState(0);
    const [hasAnimationCompleted, setHasAnimationCompleted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(max-width: 768px)").matches ||
                /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Microphone Logic
    // Only listen when the animation is done and candle is lit
    const shouldListenToMic = hasAnimationCompleted && isCandleLit;
    const { volume: micVolume, hasPermission: micPermission, requestAccess: requestMicAccess } = useMicInput(shouldListenToMic);


    const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio("/music.mp3");
        audio.loop = true;
        audio.preload = "auto";
        backgroundAudioRef.current = audio;
        return () => {
            audio.pause();
            backgroundAudioRef.current = null;
        };
    }, []);

    const startExperience = useCallback(() => {
        if (hasStarted) return;
        setHasStarted(true);

        // Request Mic Permission immediately on user interact
        requestMicAccess();

        // Play Audio
        const audio = backgroundAudioRef.current;
        if (audio && audio.paused) {
            audio.currentTime = 0;
            void audio.play().catch(() => { });
        }
    }, [hasStarted, requestMicAccess]);

    // Trigger main animation sequence after typing is done (managed by UI usually, but triggered here)
    useEffect(() => {
        if (hasStarted && !isPlaying) {
            // In the original code there was a delay. We can manage that in the UI component 
            // or just expose a explicit 'playScene' method. 
            // For now, let's keep it simple: StartExperience -> Wait -> SetIsPlaying
            // Actually, original: Typing -> Wait 1s -> setSceneStarted(true)
            // We will expose setIsPlaying to the UI layer to call when typing ends.
        }
    }, [hasStarted, isPlaying]);

    const setScenePlaying = useCallback((playing: boolean) => {
        setIsPlaying(playing);
    }, []);

    const blowCandle = useCallback(() => {
        if (hasAnimationCompleted && isCandleLit) {
            setIsCandleLit(false);
            setFireworksActive(true);
        }
    }, [hasAnimationCompleted, isCandleLit]);

    // Trigger blow candle if volume exceeds threshold
    useEffect(() => {
        if (shouldListenToMic && micVolume > 0.5) {
            blowCandle();
        }
    }, [micVolume, shouldListenToMic, blowCandle]);

    const toggleCard = useCallback((id: string | null) => {
        setActiveCardId(prev => prev === id ? null : id);
    }, []);

    const triggerInteraction = useCallback(() => {
        if (isCandleLit) {
            blowCandle();
        }
    }, [isCandleLit, blowCandle]);

    const value = {
        hasStarted,
        isPlaying, // This essentially matches 'sceneStarted' from original
        isCandleLit,
        fireworksActive,
        activeCardId,
        backgroundOpacity,
        environmentProgress,
        isMobile,
        micVolume,
        micPermission: false, // Stubbed since we removed it
        startExperience,
        triggerInteraction,
        blowCandle,
        toggleCard,
        setBackgroundOpacity,
        setEnvironmentProgress,
        setAnimationComplete: () => setHasAnimationCompleted(true),
        setScenePlaying // Extra action for the UI to trigger transition
    };

    return (
        <ExperienceContext.Provider value={value as any}>
            {children}
        </ExperienceContext.Provider>
    );
}

export function useExperience() {
    const context = useContext(ExperienceContext);
    if (!context) {
        throw new Error("useExperience must be used within an ExperienceProvider");
    }
    return context;
}
