import { useEffect, useState } from "react";
import { useExperience } from "../../context/ExperienceContext";
import { TypingIntro } from "./TypingIntro";
import "./Overlay.css";

export function Overlay() {
    const {
        hasStarted,
        startExperience,
        backgroundOpacity,
        isCandleLit,
        blowCandle,
        isPlaying,
        setScenePlaying,
        isMobile,
        triggerInteraction
    } = useExperience();

    const [typingDone, setTypingDone] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                if (!hasStarted && typingDone) {
                    startExperience();
                    setScenePlaying(true);
                } else if (isPlaying && isCandleLit) {
                    blowCandle();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [hasStarted, typingDone, startExperience, isPlaying, isCandleLit, blowCandle, setScenePlaying]);

    const handleScreenClick = () => {
        if (!hasStarted && typingDone) {
            startExperience();
            setScenePlaying(true);
        } else if (isPlaying && isCandleLit) {
            triggerInteraction(); // Handles candle blowing
        }
    };

    return (
        <>
            <div
                className="overlay-container"
                onClick={handleScreenClick}
                style={{
                    opacity: backgroundOpacity,
                    // Ensure pointer events are active for the "tap to start" phase
                    // BUT allow pass-through if the scene is playing so users can interact with cards/orbit
                    pointerEvents: (!hasStarted || (isPlaying && isCandleLit)) ? 'auto' : 'none',
                    cursor: (isPlaying && isCandleLit) ? 'pointer' : 'default',
                    zIndex: 10 // Ensure it sits on top for the initial click
                }}
            >
                {!hasStarted && (
                    <div className="intro-wrapper">
                        <TypingIntro onComplete={() => setTypingDone(true)} />
                        {typingDone && (
                            <div className="mobile-tap-hint">
                                {isMobile ? "Tap to Open" : "Press [Space] or Click to Start"}
                            </div>
                        )}
                        {/* 
                          Added invisible trigger layer for impatient users 
                          or just to ensure the whole area is clickable 
                        */}
                    </div>
                )}
            </div>

            {isPlaying && isCandleLit && backgroundOpacity < 0.5 && (
                <div
                    className="hint-text fade-in"
                // Make sure hint itself doesn't block clicks from bubbling if overlay covers it, 
                // though overlay is mostly faded out here.
                >
                    {isMobile ? "Make a wish and tap to blow the candle" : "Make a wish and press [Space] to blow the candle"}
                </div>
            )}
        </>
    );
}
