'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from "./banner.module.css";
import { useSession } from 'next-auth/react';
import { VlogPlayer } from "./VlogPlayer";

export default function Banner() {
    const [index, setIndex] = useState(0);
    const router = useRouter();
    const [playing, setPlaying] = useState(true);
    const { data: session } = useSession();

    return (
        <div className={styles.banner} onClick={() => { setIndex(index + 1) }}>
            <VlogPlayer vdoSrc="/video/BannerVideo.mp4" isPlaying={playing}></VlogPlayer>
            <div className={styles.bannerText}>
                <h1 className="text-4xl text-black font-medium">Your Travel Partner</h1>
                <h3 className="text-xl text-black font-serif">Explore Your World with Us</h3>
                <button
                    className={styles.allCarsButton}
                    onClick={(e) => { e.stopPropagation(); router.push('./car'); }}
                >
                    All Cars
                </button>
            </div>

        </div>
    );
}
