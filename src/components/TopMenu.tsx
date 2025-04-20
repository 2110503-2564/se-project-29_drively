import styles from './topmenu.module.css';
import Image from 'next/image';
import TopMenuItem from './TopMenuItem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import Link from 'next/link'; 

export default async function TopMenu() {
    const session = await getServerSession(authOptions);

    return (
        <div className={styles.menucontainer}>
            <Link href='/'>
                <Image 
                    src='/img/logo.png'
                    className={styles.logoimg}
                    alt='logo'
                    width={150}
                    height={50}
                    sizes='100vw'
                />
            </Link>

            <TopMenuItem title='Booking' pageRef='/booking' />
            <TopMenuItem title='My Booking' pageRef='/mybooking' />
            {/* <TopMenuItem title='Provider' pageRef='/provider' /> */}
            {session?.user?.role === 'car-owner' && (
                <>
                    <TopMenuItem title='Add Car' pageRef='/add-car' />
                    <TopMenuItem title='Car Request' pageRef='/request' />
                </>

            )}
            {session?.user?.role === 'admin' && (
                <TopMenuItem title='All Booking' pageRef='/allbooking' />
            )}
            {session ? (
                <Link href="/api/auth/signout">
                    <div className={styles.signedInText}>
                        Sign-Out of {session.user?.name}
                        {session.user?.role === 'admin' && (
                            <span className={styles.adminRole}>(Admin)</span>
                        )}
                    </div>
                </Link>
            ) : (
                <div className={styles.signinRegister}>
                    <Link href="/api/auth/signin" className={styles.signinLink}>Sign-In</Link>
                    <Link href="/register" className={styles.registerLink}>Register</Link>
                </div>
            )}
        </div>
    );
}