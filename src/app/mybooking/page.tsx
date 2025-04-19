
import Booko from "../../components/mybookingpage";
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; // Import authOptions from your NextAuth setup
import { getServerSession } from 'next-auth'; // NextAuth.js method to get the server-side session

export default async function Booking() {
  // Get the session for the current user
  const session = await getServerSession(authOptions);

  // Render the booking page if the user is authenticated, else show a message or redirect to login
  return (
    <div>
      {session && session.user && session.user.token ? (
        // If user is authenticated and has a token, pass it to Booko component
        <Booko token={session.user.token} />
      ) : (
        <div>Please log in to make a booking.</div>
      )}
    </div>
  );
}

