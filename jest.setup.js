import '@testing-library/jest-dom';
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
    }),
    usePathname: () => '/current-path',
    useSearchParams: () => new URLSearchParams(),
}));
jest.mock('@clerk/nextjs', () => ({
    auth: jest.fn(() => ({
        userId: 'test-user-id',
        getToken: jest.fn(),
    })),
    currentUser: jest.fn(() => ({
        id: 'test-user-id',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        fullName: 'Test User',
    })),
    useUser: jest.fn(() => ({
        isLoaded: true,
        isSignedIn: true,
        user: {
            id: 'test-user-id',
            primaryEmailAddress: { emailAddress: 'test@example.com' },
            fullName: 'Test User',
        },
    })),
    SignIn: jest.fn(() => <div>Sign In</div>),
    SignUp: jest.fn(() => <div>Sign Up</div>),
    SignedIn: jest.fn(({ children }) => <>{children}</>),
    SignedOut: jest.fn(({ children }) => <>{children}</>),
    UserButton: jest.fn(() => <div>User Button</div>),
}));
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(() => ({ data: null, error: null })),
                    limit: jest.fn(() => ({ data: [], error: null })),
                    order: jest.fn(() => ({ data: [], error: null })),
                    data: [],
                    error: null,
                })),
                order: jest.fn(() => ({ data: [], error: null })),
                data: [],
                error: null,
            })),
            insert: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn(() => ({ data: { id: 'new-id' }, error: null })),
                })),
            })),
            update: jest.fn(() => ({
                eq: jest.fn(() => ({ data: { id: 'updated-id' }, error: null })),
            })),
            delete: jest.fn(() => ({
                eq: jest.fn(() => ({ data: null, error: null })),
            })),
        })),
        rpc: jest.fn(() => ({ data: null, error: null })),
    },
}));
jest.mock('@aws-sdk/client-ses', () => ({
    SESClient: jest.fn(() => ({
        send: jest.fn(() => Promise.resolve({ MessageId: 'test-message-id' })),
    })),
    SendEmailCommand: jest.fn(),
}));
global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
}));
