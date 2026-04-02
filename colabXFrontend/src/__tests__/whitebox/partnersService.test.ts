/**
 * WHITEBOX TESTS: Partners Service
 * These unit tests verify the internal logic of the partners service functions
 * by mocking fetch and testing with knowledge of the implementation.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the API_BASE
jest.unstable_mockModule('@/lib/api', () => ({
    API_BASE: 'http://localhost:3000/api',
}));

// Import after mocking
const partnersService = await import('@/services/partnersService');

describe('Partners Service - Whitebox Tests', () => {
    const mockOrgId = 'org-123';
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getPartners', () => {
        it('should fetch partners with correct headers', async () => {
            const mockPartners = [
                { id: 'p1', name: 'Partner 1', type: 'reseller', status: 'active' },
                { id: 'p2', name: 'Partner 2', type: 'agent', status: 'active' },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partners: mockPartners }),
            } as Response);

            const result = await partnersService.getPartners(mockOrgId);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/partners',
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-org-id': mockOrgId,
                    },
                })
            );
            expect(result.partners).toEqual(mockPartners);
        });

        it('should throw error when response is not ok', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Unauthorized' }),
            } as Response);

            await expect(partnersService.getPartners(mockOrgId))
                .rejects
                .toThrow('Unauthorized');
        });

        it('should throw default error when no error message', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({}),
            } as Response);

            await expect(partnersService.getPartners(mockOrgId))
                .rejects
                .toThrow('Failed to fetch partners');
        });
    });

    describe('getPartnerById', () => {
        it('should fetch partner by ID with teams', async () => {
            const mockPartner = {
                id: 'partner-1',
                name: 'Test Partner',
                type: 'technology',
                status: 'active',
            };
            const mockTeams = [{ id: 't1', name: 'Team 1', memberCount: 3 }];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partner: mockPartner, teams: mockTeams }),
            } as Response);

            const result = await partnersService.getPartnerById(mockOrgId, 'partner-1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/partners/partner-1',
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'x-org-id': mockOrgId,
                    }),
                })
            );
            expect(result.partner).toEqual(mockPartner);
            expect(result.teams).toEqual(mockTeams);
        });

        it('should throw error when partner not found', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Partner not found' }),
            } as Response);

            await expect(partnersService.getPartnerById(mockOrgId, 'nonexistent'))
                .rejects
                .toThrow('Partner not found');
        });
    });

    describe('createPartner', () => {
        it('should create partner with required fields', async () => {
            const input = { name: 'New Partner', type: 'reseller' as const };
            const mockCreated = {
                id: 'partner-new',
                ...input,
                status: 'active',
                orgId: mockOrgId,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partner: mockCreated }),
            } as Response);

            const result = await partnersService.createPartner(mockOrgId, input);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/partners',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(input),
                })
            );
            expect(result.partner.name).toBe('New Partner');
        });

        it('should create partner with all optional fields', async () => {
            const input = {
                name: 'Full Partner',
                type: 'technology' as const,
                contactEmail: 'contact@partner.com',
                industry: 'Technology',
                onboardingDate: '2024-01-15',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partner: { id: 'p1', ...input } }),
            } as Response);

            const result = await partnersService.createPartner(mockOrgId, input);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify(input),
                })
            );
            expect(result.partner.contactEmail).toBe('contact@partner.com');
        });

        it('should throw error on validation failure', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Name is required' }),
            } as Response);

            await expect(
                partnersService.createPartner(mockOrgId, { name: '', type: 'reseller' })
            ).rejects.toThrow('Name is required');
        });
    });

    describe('updatePartner', () => {
        it('should update partner name', async () => {
            const input = { name: 'Updated Name' };
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partner: { id: 'p1', ...input } }),
            } as Response);

            const result = await partnersService.updatePartner(mockOrgId, 'p1', input);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/partners/p1',
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify(input),
                })
            );
            expect(result.partner.name).toBe('Updated Name');
        });

        it('should update multiple fields', async () => {
            const input = {
                name: 'New Name',
                type: 'agent' as const,
                status: 'suspended',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partner: { id: 'p1', ...input } }),
            } as Response);

            await partnersService.updatePartner(mockOrgId, 'p1', input);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify(input),
                })
            );
        });

        it('should clear onboarding date with null', async () => {
            const input = { onboardingDate: null };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partner: { id: 'p1', onboardingDate: null } }),
            } as Response);

            const result = await partnersService.updatePartner(mockOrgId, 'p1', input);

            expect(result.partner.onboardingDate).toBeNull();
        });
    });

    describe('deletePartner', () => {
        it('should soft delete partner', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    partner: { id: 'p1', name: 'Deleted', status: 'inactive' },
                }),
            } as Response);

            const result = await partnersService.deletePartner(mockOrgId, 'p1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/partners/p1',
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
            expect(result.partner.status).toBe('inactive');
        });

        it('should throw error when partner not found', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Partner not found' }),
            } as Response);

            await expect(partnersService.deletePartner(mockOrgId, 'nonexistent'))
                .rejects
                .toThrow('Partner not found');
        });
    });

    describe('getPartnerDeals', () => {
        it('should fetch deals for a partner', async () => {
            const mockDeals = [
                { id: 'd1', title: 'Deal 1', stage: 'lead', value: 10000 },
                { id: 'd2', title: 'Deal 2', stage: 'won', value: 50000 },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deals: mockDeals }),
            } as Response);

            const result = await partnersService.getPartnerDeals(mockOrgId, 'partner-1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/deals?partnerId=partner-1',
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'x-org-id': mockOrgId,
                    }),
                })
            );
            expect(result.deals).toHaveLength(2);
        });

        it('should return empty deals array for partner with no deals', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deals: [] }),
            } as Response);

            const result = await partnersService.getPartnerDeals(mockOrgId, 'partner-no-deals');

            expect(result.deals).toEqual([]);
        });
    });
});
