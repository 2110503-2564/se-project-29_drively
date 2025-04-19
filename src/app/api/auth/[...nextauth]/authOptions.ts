import { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import userLogin from "@/libs/userLogin";

interface CustomUser extends User {
    role: string;
    token: string;
    id : string;
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    console.error("Missing credentials");
                    return null;
                }

                try {
                    const user = await userLogin(credentials.email, credentials.password);

                    if (user && user.token) {
                        const formattedUser: CustomUser = {
                            id: user._id.toString(),
                            name: user.name || "",
                            email: user.email || "",
                            role: typeof user.role === "string" ? user.role : "user", // Ensure role is a string
                            token: user.token || "",
                        };
                        return formattedUser;
                    } else {
                        console.error("Invalid credentials or missing token");
                        return null;
                    }
                } catch (error) {
                    console.error("Error in authorize:", error);
                    return null;
                }
            }
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    id: user.id,
                    name: user.name || "",
                    email: user.email || "",
                    role: typeof (user as CustomUser).role === "string" ? (user as CustomUser).role : "user",
                    token: typeof (user as CustomUser).token === "string" ? (user as CustomUser).token : "",
                };
            }
            return token;
        },
        async session({session, token, user}) {
          session.user = token as any
          return session
      }
    }
};
