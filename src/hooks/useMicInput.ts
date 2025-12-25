import { useState, useEffect, useRef, useCallback } from "react";

export function useMicInput(isActive: boolean) {
    const [volume, setVolume] = useState(0);
    const [hasPermission, setHasPermission] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const rafRef = useRef<number | null>(null);

    const startListening = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setHasPermission(true);

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);

                // Calculate average volume
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;

                // Normalize 0-1 (roughly, though 255 is max)
                // Sensitivity adjustment: divided by 50 to make it easier to trigger
                setVolume(Math.min(average / 40, 1.5));

                rafRef.current = requestAnimationFrame(updateVolume);
            };

            updateVolume();

        } catch (error) {
            console.error("Microphone access denied:", error);
            setHasPermission(false);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (audioContextRef.current) audioContextRef.current.close();
        if (sourceRef.current) sourceRef.current.disconnect();

        audioContextRef.current = null;
        analyserRef.current = null;
        sourceRef.current = null;
    }, []);

    useEffect(() => {
        if (isActive) {
            startListening();
        } else {
            stopListening();
        }
        return () => stopListening();
    }, [isActive, startListening, stopListening]);

    return { volume, hasPermission };
}
