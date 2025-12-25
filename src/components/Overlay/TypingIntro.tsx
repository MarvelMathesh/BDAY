import { useEffect, useState } from "react";

const TYPED_LINES = [
    "> Ashwika",
    "...",
    "> today is your birthday",
    "...",
    "> so i made you this website",
    "...",
    "> ٩(◕‿◕)۶ ٩(◕‿◕)۶ ٩(◕‿◕)۶",
    "> ",
    "> press [space]/[Tap] to enter"
];

const TYPED_CHAR_DELAY = 50; // Faster typing for modern feel
const CURSOR_BLINK_INTERVAL = 500;

interface TypingIntroProps {
    onComplete?: () => void;
}

export function TypingIntro({ onComplete }: TypingIntroProps) {
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [cursorVisible, setCursorVisible] = useState(true);

    // Blink cursor
    useEffect(() => {
        const handle = setInterval(() => setCursorVisible((p) => !p), CURSOR_BLINK_INTERVAL);
        return () => clearInterval(handle);
    }, []);

    // Typing Logic
    useEffect(() => {
        const currentLine = TYPED_LINES[currentLineIndex];

        if (currentLineIndex >= TYPED_LINES.length) {
            onComplete?.();
            return;
        }

        if (currentCharIndex < currentLine.length) {
            const timeout = setTimeout(() => {
                setCurrentCharIndex((prev) => prev + 1);
            }, TYPED_CHAR_DELAY);
            return () => clearTimeout(timeout);
        } else {
            // Line finished, wait a bit then go next
            const timeout = setTimeout(() => {
                setCurrentLineIndex((prev) => prev + 1);
                setCurrentCharIndex(0);
            }, 400); // Pause between lines
            return () => clearTimeout(timeout);
        }
    }, [currentLineIndex, currentCharIndex, onComplete]);

    // Render logic
    return (
        <div className="typed-text-container">
            {TYPED_LINES.slice(0, currentLineIndex + 1).map((line, index) => {
                const isCurrentLine = index === currentLineIndex;
                const textToRender = isCurrentLine ? line.slice(0, currentCharIndex) : line;
                const showCursor = isCurrentLine || (index === TYPED_LINES.length - 1 && currentLineIndex >= TYPED_LINES.length);

                return (
                    <div key={index} className="typed-line">
                        {textToRender}
                        {showCursor && cursorVisible && <span className="cursor">_</span>}
                    </div>
                );
            })}
        </div>
    );
}
