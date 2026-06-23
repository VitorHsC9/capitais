import { describe, expect, it, vi } from 'vitest';

const firebaseMocks = vi.hoisted(() => ({
    app: { name: 'capitais-test' },
    db: { url: 'db-test' },
    initializeApp: vi.fn(),
    getDatabase: vi.fn(),
}));

vi.mock('firebase/app', () => ({
    initializeApp: firebaseMocks.initializeApp,
}));

vi.mock('firebase/database', () => ({
    getDatabase: firebaseMocks.getDatabase,
}));

describe('firebase service', () => {
    it('initializes the Firebase app and exports the database', async () => {
        firebaseMocks.initializeApp.mockReturnValue(firebaseMocks.app);
        firebaseMocks.getDatabase.mockReturnValue(firebaseMocks.db);

        const service = await import('./firebase');

        const firebaseConfig = firebaseMocks.initializeApp.mock.calls[0]?.[0];
        expect(Object.keys(firebaseConfig).sort()).toEqual([
            'apiKey',
            'appId',
            'authDomain',
            'databaseURL',
            'messagingSenderId',
            'projectId',
            'storageBucket',
        ]);
        expect(firebaseMocks.getDatabase).toHaveBeenCalledWith(firebaseMocks.app);
        expect(service.db).toBe(firebaseMocks.db);
    });
});
