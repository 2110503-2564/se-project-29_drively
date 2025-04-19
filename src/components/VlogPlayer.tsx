'use client'
import { useRef, useEffect } from 'react';

export function VlogPlayer({ vdoSrc, isPlaying }: { vdoSrc: string, isPlaying: boolean }) {
    const vdoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isPlaying) {
            vdoRef.current?.play();
        } else {
            vdoRef.current?.pause();
        }
    }, [isPlaying]);

    return (
        <video 
            className="absolute top-0 left-0 w-full h-full object-cover z-[-1] opacity-50" 
            src={vdoSrc} 
            ref={vdoRef} 
            controls 
            loop 
            muted 
        />
    );
}
