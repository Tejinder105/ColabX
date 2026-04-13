/**
 * BLACKBOX TESTS: Partners Integration Tests
 * These tests verify the partners module behavior from an integration perspective,
 * treating the service layer as a black box and testing inputs/outputs.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock the API_BASE
jest.unstable_mockModule('@/lib/api', () => ({
    API_BASE: '/api',
}));

const partnersService = await import('@/services/partnersService');

describe('Partners Module - Blackbox Integration Tests', () => {
    const orgId = 'test-org-123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Partner Listing', () => {
        it('should successfully retrieve a list of partners', async () => {
            const expectedPartners = [
                { partnerId: 'p1', name: 'Acme Corp', type: 'reseller', status: 'active' },
                { partnerId: 'p2', name: 'Tech Inc', type: 'technology', status: 'active' },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partners: expectedPartners }),
            } as Response);

            const result = await partnersService.getPartners(orgId);

            expect(result.partners).toHaveLength(2);
            expect(result.partners[0].name).toBe('Acme Corp');
            expect(result.partners[1].type).toBe('technology');
        });

        it('should return empty list when no partners exist', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partners: [] }),
            } as Response);

            const result = await partnersService.getPartners(orgId);

            expect(result.partners).toHaveLength(0);
        });

        it('should fail with appropriate error when unauthorized', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Unauthorized access' }),
            } as Response);

            await expect(partnersService.getPartners(orgId))
                .rejects.toThrow('Unauthorized access');
        });
    });

    describe('Partner Creation', () => {
        it('should successfully create a partner with minimum required fields', async () => {
            const input = { name: 'New Partner', type: 'reseller' as const };
            const expectedPartner = {
                partnerId: 'new-partner-id',
                ...input,
                status: 'active',
                contactEmail: null,
                industry: null,
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partner: expectedPartner }),
            } as Response);

            const result = await partnersService.createPartner(orgId, input);

            expect(result.partner.partnerId).toBeDefined();
            expect(result.partner.name).toBe('New Partner');
            expect(result.partner.type).toBe('reseller');
            expect(result.partner.status).toBe('active');
        });

        it('should successfully create a partner with all optional fields', async () => {
            const input = {
                name: 'Full Partner',
                type: 'technology' as const,
                contactEmail: 'contact@partner.com',
                industry: 'Software',
                onboardingDate: '2024-01-15',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    partner: { partnerId: 'full-partner-id', ...input, status: 'active' },
                }),
            } as Response);

            const result = await partnersService.createPartner(orgId, input);

            expect(result.partner.contactEmail).toBe('contact@partner.com');
            expect(result.partner.industry).toBe('Software');
        });

        it('should fail when partner name is missing', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Partner name is required' }),
            } as Response);

            await expect(
                partnersService.createPartner(orgId, { name: '', type: 'reseller' })
            ).rejects.toThrow('Partner name is required');
        });
    });

    describe('Partner Retrieval', () => {
        it('should retrieve a specific partner by ID', async () => {
            const expectedPartner = {
                partnerId: 'partner-123',
                name: 'Specific Partner',
                type: 'agent',
                status: 'active',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partner: expectedPartner, teams: [] }),
            } as Response);

            const result = await partnersService.getPartnerById(orgId, 'partner-123');

            expect(result.partner.partnerId).toBe('partner-123');
            expect(result.partner.name).toBe('Specific Partner');
        });

        it('should fail when partner does not exist', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Partner not found' }),
            } as Response);

            await expect(
                partnersService.getPartnerById(orgId, 'nonexistent')
            ).rejects.toThrow('Partner not found');
        });

        it('should include associated teams in response', async () => {
            const expectedTeams = [
                { teamId: 't1', name: 'Sales Team', memberCount: 5 },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    partner: { partnerId: 'p1', name: 'Partner' },
                    teams: expectedTeams,
                }),
            } as Response);

            const result = await partnersService.getPartnerById(orgId, 'p1');

            expect(result.teams).toHaveLength(1);
            expect(result.teams[0].name).toBe('Sales Team');
        });
    });

    describe('Partner Update', () => {
        it('should update partner name successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    partner: { partnerId: 'p1', name: 'Updated Name' },
                }),
            } as Response);

            const result = await partnersService.updatePartner(orgId, 'p1', {
                name: 'Updated Name',
            });

            expect(result.partner.name).toBe('Updated Name');
        });

        it('should update partner status successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    partner: { partnerId: 'p1', status: 'suspended' },
                }),
            } as Response);

            const result = await partnersService.updatePartner(orgId, 'p1', {
                status: 'suspended',
            });

            expect(result.partner.status).toBe('suspended');
        });

        it('should fail when partner not found', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Partner not found' }),
            } as Response);

            await expect(
                partnersService.updatePartner(orgId, 'nonexistent', { name: 'New' })
            ).rejects.toThrow('Partner not found');
        });
    });

    describe('Partner Deletion (Soft Delete)', () => {
        it('should soft delete partner by setting status to inactive', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    partner: { partnerId: 'p1', name: 'Deleted Partner', status: 'inactive' },
                }),
            } as Response);

            const result = await partnersService.deletePartner(orgId, 'p1');

            expect(result.partner.status).toBe('inactive');
            expect(result.partner.name).toBe('Deleted Partner');
        });

        it('should fail when partner not found', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Partner not found' }),
            } as Response);

            await expect(
                partnersService.deletePartner(orgId, 'nonexistent')
            ).rejects.toThrow('Partner not found');
        });
    });

    describe('Partner Deals', () => {
        it('should retrieve deals associated with a partner', async () => {
            const expectedDeals = [
                { dealId: 'd1', title: 'Big Deal', stage: 'won', value: 100000 },
                { dealId: 'd2', title: 'Pending Deal', stage: 'proposal', value: 50000 },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deals: expectedDeals }),
            } as Response);

            const result = await partnersService.getPartnerDeals(orgId, 'partner-123');

            expect(result.deals).toHaveLength(2);
            expect(result.deals[0].title).toBe('Big Deal');
            expect(result.deals[1].stage).toBe('proposal');
        });

        it('should return empty deals array when partner has no deals', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deals: [] }),
            } as Response);

            const result = await partnersService.getPartnerDeals(orgId, 'partner-no-deals');

            expect(result.deals).toHaveLength(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle server errors gracefully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Internal server error' }),
            } as Response);

            await expect(partnersService.getPartners(orgId))
                .rejects.toThrow('Internal server error');
        });

        it('should handle network failures', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(partnersService.getPartners(orgId))
                .rejects.toThrow('Network error');
        });

        it('should provide default error message when server returns no message', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({}),
            } as Response);

            await expect(partnersService.getPartners(orgId))
                .rejects.toThrow('Failed to fetch partners');
        });
    });

    describe('API Contract', () => {
        it('should send organization ID in request headers', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partners: [] }),
            } as Response);

            await partnersService.getPartners(orgId);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'x-org-id': orgId,
                    }),
                })
            );
        });

        it('should include credentials in all requests', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partners: [] }),
            } as Response);

            await partnersService.getPartners(orgId);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    credentials: 'include',
                })
            );
        });

        it('should send JSON content type for POST requests', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partner: { partnerId: 'p1' } }),
            } as Response);

            await partnersService.createPartner(orgId, { name: 'Test', type: 'reseller' });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });
    });
});
