import React, { useState, useEffect, useRef, useCallback } from "react";

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
                // Sensitivity adjustment: divided by 20 to make it easier to trigger
                setVolume(Math.min(average / 20, 1.5));

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

    const requestAccess = useCallback(async () => {
        if (hasPermission) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setHasPermission(true);
            // We can keep the stream open or close it. 
            // If we close, we need to reopen later. 
            // Better to just let startListening handle the persistent stream if active.
            // But for 'priming', we might just want to get the permission bit flipped.

            // Actually, if we just want to ensure permission, we can do this:
            stream.getTracks().forEach(t => t.stop());
        } catch (e) {
            console.error("Mic permission denied");
        }
    }, [hasPermission]);

    return { volume, hasPermission, requestAccess };
}
