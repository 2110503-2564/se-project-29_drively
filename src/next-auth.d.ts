import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            _id: string;
            name: string;
            email: string;
            role: string;
            token: string;
        };
    }
}
