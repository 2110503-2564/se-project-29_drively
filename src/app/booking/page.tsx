import Booko from "../../components/Bookingpage";
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { getServerSession } from 'next-auth';

export default async function Booking() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      {session && session.user && (
     <Booko token={session.user.token} />
      )}
      
    </div>
  );
}