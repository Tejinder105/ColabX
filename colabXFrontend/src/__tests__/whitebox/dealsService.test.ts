/**
 * WHITEBOX TESTS: Deals Service
 * These unit tests verify the internal logic of the deals service functions
 * by mocking fetch and testing with knowledge of the implementation.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the API_BASE
jest.unstable_mockModule('@/lib/api', () => ({
    API_BASE: 'http://localhost:3000/api',
}));

// Import after mocking
const dealsService = await import('@/services/dealsService');

describe('Deals Service - Whitebox Tests', () => {
    const mockOrgId = 'org-123';
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDeals', () => {
        it('should fetch deals with correct headers', async () => {
            const mockDeals = [
                { id: 'd1', title: 'Deal 1', stage: 'lead', value: 10000 },
                { id: 'd2', title: 'Deal 2', stage: 'won', value: 50000 },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deals: mockDeals }),
            } as Response);

            const result = await dealsService.getDeals(mockOrgId);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/deals',
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-org-id': mockOrgId,
                    },
                })
            );
            expect(result.deals).toEqual(mockDeals);
        });

        it('should throw error when response is not ok', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Access denied' }),
            } as Response);

            await expect(dealsService.getDeals(mockOrgId))
                .rejects
                .toThrow('Access denied');
        });

        it('should throw default error when no error message', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({}),
            } as Response);

            await expect(dealsService.getDeals(mockOrgId))
                .rejects
                .toThrow('Failed to fetch deals');
        });
    });

    describe('getDealById', () => {
        it('should fetch deal details by ID', async () => {
            const mockDeal = {
                id: 'deal-1',
                title: 'Test Deal',
                stage: 'proposal',
                value: 25000,
            };
            const mockPartner = { id: 'p1', name: 'Partner Corp' };
            const mockAssignments = [
                { id: 'a1', userId: 'u1', userName: 'John' },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    deal: mockDeal,
                    partner: mockPartner,
                    assignments: mockAssignments,
                    activities: [],
                }),
            } as Response);

            const result = await dealsService.getDealById(mockOrgId, 'deal-1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/deals/deal-1',
                expect.objectContaining({
                    method: 'GET',
                })
            );
            expect(result.deal).toEqual(mockDeal);
            expect(result.partner).toEqual(mockPartner);
            expect(result.assignments).toHaveLength(1);
        });

        it('should throw error when deal not found', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Deal not found' }),
            } as Response);

            await expect(dealsService.getDealById(mockOrgId, 'nonexistent'))
                .rejects
                .toThrow('Deal not found');
        });

        it('should handle deal without partner', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    deal: { id: 'd1', title: 'No Partner Deal' },
                    partner: null,
                    assignments: [],
                    activities: [],
                }),
            } as Response);

            const result = await dealsService.getDealById(mockOrgId, 'd1');

            expect(result.partner).toBeNull();
        });
    });

    describe('createDeal', () => {
        it('should create deal with required fields', async () => {
            const input = { partnerId: 'p1', title: 'New Deal' };
            const mockCreated = {
                id: 'deal-new',
                ...input,
                stage: 'lead',
                value: null,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deal: mockCreated }),
            } as Response);

            const result = await dealsService.createDeal(mockOrgId, input);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/deals',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(input),
                })
            );
            expect(result.deal.title).toBe('New Deal');
            expect(result.deal.stage).toBe('lead');
        });

        it('should create deal with all fields', async () => {
            const input = {
                partnerId: 'p1',
                title: 'Big Deal',
                description: 'A very important deal',
                value: 100000,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deal: { id: 'd1', ...input, stage: 'lead' } }),
            } as Response);

            const result = await dealsService.createDeal(mockOrgId, input);

            expect(result.deal.description).toBe('A very important deal');
            expect(result.deal.value).toBe(100000);
        });

        it('should throw error when partner not found', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Partner not found in this organization' }),
            } as Response);

            await expect(
                dealsService.createDeal(mockOrgId, { partnerId: 'invalid', title: 'Deal' })
            ).rejects.toThrow('Partner not found in this organization');
        });
    });

    describe('updateDeal', () => {
        it('should update deal title', async () => {
            const input = { title: 'Updated Title' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deal: { id: 'd1', ...input } }),
            } as Response);

            const result = await dealsService.updateDeal(mockOrgId, 'd1', input);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/deals/d1',
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify(input),
                })
            );
            expect(result.deal.title).toBe('Updated Title');
        });

        it('should update deal stage to proposal', async () => {
            const input = { stage: 'proposal' as const };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deal: { id: 'd1', stage: 'proposal' } }),
            } as Response);

            const result = await dealsService.updateDeal(mockOrgId, 'd1', input);

            expect(result.deal.stage).toBe('proposal');
        });

        it('should update deal stage to negotiation', async () => {
            const input = { stage: 'negotiation' as const };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deal: { id: 'd1', stage: 'negotiation' } }),
            } as Response);

            const result = await dealsService.updateDeal(mockOrgId, 'd1', input);

            expect(result.deal.stage).toBe('negotiation');
        });

        it('should update deal stage to won', async () => {
            const input = { stage: 'won' as const };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deal: { id: 'd1', stage: 'won' } }),
            } as Response);

            const result = await dealsService.updateDeal(mockOrgId, 'd1', input);

            expect(result.deal.stage).toBe('won');
        });

        it('should update deal value', async () => {
            const input = { value: 75000 };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deal: { id: 'd1', value: 75000 } }),
            } as Response);

            const result = await dealsService.updateDeal(mockOrgId, 'd1', input);

            expect(result.deal.value).toBe(75000);
        });

        it('should clear description with null', async () => {
            const input = { description: null };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deal: { id: 'd1', description: null } }),
            } as Response);

            const result = await dealsService.updateDeal(mockOrgId, 'd1', input);

            expect(result.deal.description).toBeNull();
        });

        it('should update multiple fields', async () => {
            const input = {
                title: 'New Title',
                value: 50000,
                stage: 'proposal' as const,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deal: { id: 'd1', ...input } }),
            } as Response);

            await dealsService.updateDeal(mockOrgId, 'd1', input);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify(input),
                })
            );
        });

        it('should throw error when deal not found', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Deal not found' }),
            } as Response);

            await expect(
                dealsService.updateDeal(mockOrgId, 'nonexistent', { title: 'New' })
            ).rejects.toThrow('Deal not found');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(dealsService.getDeals(mockOrgId))
                .rejects
                .toThrow('Network error');
        });

        it('should handle JSON parse errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => { throw new Error('Invalid JSON'); },
            } as unknown as Response);

            await expect(dealsService.getDeals(mockOrgId))
                .rejects
                .toThrow('Invalid JSON');
        });

        it('should send correct org ID in headers for all requests', async () => {
            const differentOrgId = 'org-different';

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deals: [] }),
            } as Response);

            await dealsService.getDeals(differentOrgId);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'x-org-id': differentOrgId,
                    }),
                })
            );
        });

        it('should always include credentials in requests', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deals: [] }),
            } as Response);

            await dealsService.getDeals(mockOrgId);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    credentials: 'include',
                })
            );
        });
    });
});
