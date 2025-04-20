import MyListings from "../../components/myListing";
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'; // Import authOptions from your NextAuth setup
import { getServerSession } from 'next-auth'; // NextAuth.js method to get the server-side session

export default async function mylistings() {
  // Get the session for the current user
  const session = await getServerSession(authOptions);

  // Render the booking page if the user is authenticated, else show a message or redirect to login
  return (
    <div>
      {session && session.user && session.user.token ? (
        <MyListings token={session.user.token} />
      ) : (
        <div>Please log in to view mylistings.</div>
      )}
    </div>
  );
}