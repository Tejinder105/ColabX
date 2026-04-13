/**
 * BLACKBOX TESTS: Deals Integration Tests
 * These tests verify the deals module behavior from an integration perspective,
 * treating the service layer as a black box and testing inputs/outputs.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

jest.unstable_mockModule('@/lib/api', () => ({
    API_BASE: '/api',
}));

const dealsService = await import('@/services/dealsService');

describe('Deals Module - Blackbox Integration Tests', () => {
    const orgId = 'test-org-123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Deal Listing', () => {
        it('should successfully retrieve a list of deals', async () => {
            const expectedDeals = [
                { dealId: 'd1', title: 'Expansion Deal', stage: 'proposal', value: 50000 },
                { dealId: 'd2', title: 'Renewal Deal', stage: 'won', value: 120000 },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deals: expectedDeals }),
            } as Response);

            const result = await dealsService.getDeals(orgId);

            expect(result.deals).toHaveLength(2);
            expect(result.deals[0].title).toBe('Expansion Deal');
            expect(result.deals[1].stage).toBe('won');
        });

        it('should return an empty list when no deals exist', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deals: [] }),
            } as Response);

            const result = await dealsService.getDeals(orgId);

            expect(result.deals).toEqual([]);
        });

        it('should fail with the server error when listing is not allowed', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Unauthorized access' }),
            } as Response);

            await expect(dealsService.getDeals(orgId)).rejects.toThrow('Unauthorized access');
        });
    });

    describe('Deal Creation', () => {
        it('should successfully create a deal with required fields', async () => {
            const input = { partnerId: 'partner-1', title: 'New Deal' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    deal: { dealId: 'deal-new', ...input, stage: 'lead', value: null },
                }),
            } as Response);

            const result = await dealsService.createDeal(orgId, input);

            expect(result.deal.dealId).toBe('deal-new');
            expect(result.deal.title).toBe('New Deal');
            expect(result.deal.stage).toBe('lead');
        });

        it('should successfully create a deal with optional fields', async () => {
            const input = {
                partnerId: 'partner-1',
                teamId: 'team-1',
                title: 'Enterprise Deal',
                description: 'Shared partner opportunity',
                value: 90000,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    deal: { dealId: 'deal-full', ...input, stage: 'proposal' },
                }),
            } as Response);

            const result = await dealsService.createDeal(orgId, input);

            expect(result.deal.partnerId).toBe('partner-1');
            expect(result.deal.value).toBe(90000);
            expect(result.deal.stage).toBe('proposal');
        });

        it('should fail when partner validation fails', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Partner not found in this organization' }),
            } as Response);

            await expect(
                dealsService.createDeal(orgId, { partnerId: 'missing', title: 'Deal' })
            ).rejects.toThrow('Partner not found in this organization');
        });
    });

    describe('Deal Details and Updates', () => {
        it('should retrieve deal details with related records', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    deal: { dealId: 'deal-1', title: 'Expansion Deal', stage: 'proposal' },
                    partner: { partnerId: 'partner-1', name: 'Acme Corp' },
                    assignments: [{ dealAssignmentId: 'a1', userId: 'user-1', userName: 'Asha' }],
                    tasks: [],
                    documents: [],
                    activities: [],
                }),
            } as Response);

            const result = await dealsService.getDealById(orgId, 'deal-1');

            expect(result.deal.title).toBe('Expansion Deal');
            expect(result.partner?.name).toBe('Acme Corp');
            expect(result.assignments).toHaveLength(1);
        });

        it('should update a deal stage and value', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    deal: { dealId: 'deal-1', stage: 'won', value: 150000 },
                }),
            } as Response);

            const result = await dealsService.updateDeal(orgId, 'deal-1', {
                stage: 'won',
                value: 150000,
            });

            expect(result.deal.stage).toBe('won');
            expect(result.deal.value).toBe(150000);
        });

        it('should fail when a deal does not exist', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Deal not found' }),
            } as Response);

            await expect(dealsService.getDealById(orgId, 'missing')).rejects.toThrow(
                'Deal not found'
            );
        });
    });

    describe('Deal Collaboration', () => {
        it('should assign a user to a deal', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    assignment: { dealAssignmentId: 'assignment-1', dealId: 'deal-1', userId: 'user-1' },
                }),
            } as Response);

            const result = await dealsService.assignUserToDeal(orgId, 'deal-1', 'user-1');

            expect(result.assignment.userId).toBe('user-1');
        });

        it('should create and return a deal task', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    task: { dealTaskId: 'task-1', title: 'Send proposal', status: 'todo' },
                }),
            } as Response);

            const result = await dealsService.createDealTask(orgId, 'deal-1', {
                title: 'Send proposal',
            });

            expect(result.task.title).toBe('Send proposal');
            expect(result.task.status).toBe('todo');
        });
    });

    describe('API Contract', () => {
        it('should send organization ID and credentials with requests', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deals: [] }),
            } as Response);

            await dealsService.getDeals(orgId);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    credentials: 'include',
                    headers: expect.objectContaining({
                        'x-org-id': orgId,
                    }),
                })
            );
        });
    });
});
