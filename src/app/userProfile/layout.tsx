import styles from './booking.module.css';

export default function ReservationLaout( {children} : {children: React.ReactNode}) {
return (
<div className={styles.sectionlaout}>
    {/* <ReservationMenu/> */}
    {children}
</div>
);  
}