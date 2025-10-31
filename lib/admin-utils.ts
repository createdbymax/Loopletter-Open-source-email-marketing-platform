import { clerkClient } from '@clerk/nextjs/server';
export async function promoteUserToSuperAdmin(email: string): Promise<boolean> {
    try {
        const client = await clerkClient();
        const usersResponse = await client.users.getUserList({
            emailAddress: [email]
        });
        if (usersResponse.data.length === 0) {
            console.error(`No user found with email: ${email}`);
            return false;
        }
        const user = usersResponse.data[0];
        await client.users.updateUserMetadata(user.id, {
            publicMetadata: {
                role: 'super_admin',
                promoted_at: new Date().toISOString()
            }
        });
        console.log(`Successfully promoted ${email} to super admin`);
        return true;
    }
    catch (error) {
        console.error('Error promoting user to super admin:', error);
        return false;
    }
}
export async function demoteUserFromSuperAdmin(email: string): Promise<boolean> {
    try {
        const client = await clerkClient();
        const usersResponse = await client.users.getUserList({
            emailAddress: [email]
        });
        if (usersResponse.data.length === 0) {
            console.error(`No user found with email: ${email}`);
            return false;
        }
        const user = usersResponse.data[0];
        await client.users.updateUserMetadata(user.id, {
            publicMetadata: {
                role: null,
                demoted_at: new Date().toISOString()
            }
        });
        console.log(`Successfully removed super admin status from ${email}`);
        return true;
    }
    catch (error) {
        console.error('Error demoting user from super admin:', error);
        return false;
    }
}
export async function listSuperAdmins(): Promise<Array<{
    id: string;
    email: string;
    promotedAt?: string;
}>> {
    try {
        const client = await clerkClient();
        const usersResponse = await client.users.getUserList({ limit: 100 });
        const superAdmins = usersResponse.data
            .filter((user: any) => user.publicMetadata?.role === 'super_admin')
            .map((user: any) => ({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || 'No email',
            promotedAt: user.publicMetadata?.promoted_at as string
        }));
        return superAdmins;
    }
    catch (error) {
        console.error('Error listing super admins:', error);
        return [];
    }
}
