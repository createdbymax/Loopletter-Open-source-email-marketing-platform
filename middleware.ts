import { clerkMiddleware } from '@clerk/nextjs/server';
export default clerkMiddleware((auth, req) => {
    if (req.nextUrl.pathname === '/api/queue/process-all') {
        return;
    }
    return;
});
export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
