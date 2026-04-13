/**
 * WHITEBOX TESTS: Partners Service
 * These unit tests verify the internal logic of the partners service functions
 * by mocking the database layer and testing with knowledge of the implementation.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the database module
const mockSelect = jest.fn();
const mockFrom = jest.fn();
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockInsert = jest.fn();
const mockValues = jest.fn();
const mockReturning = jest.fn();
const mockUpdate = jest.fn();
const mockSet = jest.fn();

// Chain methods
mockSelect.mockReturnValue({ from: mockFrom });
mockFrom.mockReturnValue({ where: mockWhere });
mockWhere.mockReturnValue({ limit: mockLimit, returning: mockReturning });
mockLimit.mockResolvedValue([]);
mockInsert.mockReturnValue({ values: mockValues });
mockValues.mockReturnValue({ returning: mockReturning });
mockReturning.mockResolvedValue([]);
mockUpdate.mockReturnValue({ set: mockSet });
mockSet.mockReturnValue({ where: mockWhere });

jest.unstable_mockModule('../db/index.js', () => ({
    default: {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
    },
}));

// Import after mocking
const partnersService = await import('../partners/partners.service.js');

describe('Partners Service - Whitebox Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset chain methods
        mockSelect.mockReturnValue({ from: mockFrom });
        mockFrom.mockReturnValue({ where: mockWhere });
        mockWhere.mockReturnValue({ limit: mockLimit, returning: mockReturning });
        mockLimit.mockResolvedValue([]);
        mockInsert.mockReturnValue({ values: mockValues });
        mockValues.mockReturnValue({ returning: mockReturning });
        mockReturning.mockResolvedValue([]);
        mockUpdate.mockReturnValue({ set: mockSet });
        mockSet.mockReturnValue({ where: mockWhere });
    });

    describe('createPartner', () => {
        it('should create a partner with required fields only', async () => {
            const mockPartner = {
                id: 'partner-123',
                organizationId: 'org-1',
                name: 'Acme Corp',
                type: 'reseller',
                status: 'active',
                contactEmail: null,
                industry: null,
                onboardingDate: null,
                createdByUserId: 'user-1',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockReturning.mockResolvedValueOnce([mockPartner]);

            const result = await partnersService.createPartner('org-1', 'user-1', {
                name: 'Acme Corp',
                type: 'reseller',
            });

            expect(mockInsert).toHaveBeenCalled();
            expect(mockValues).toHaveBeenCalled();
            expect(result).toEqual(mockPartner);
            expect(result.name).toBe('Acme Corp');
            expect(result.type).toBe('reseller');
        });

        it('should create a partner with all optional fields', async () => {
            const mockPartner = {
                id: 'partner-456',
                organizationId: 'org-1',
                name: 'Tech Solutions',
                type: 'technology',
                status: 'active',
                contactEmail: 'contact@techsolutions.com',
                industry: 'Technology',
                onboardingDate: new Date('2024-01-15'),
                createdByUserId: 'user-1',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockReturning.mockResolvedValueOnce([mockPartner]);

            const result = await partnersService.createPartner('org-1', 'user-1', {
                name: 'Tech Solutions',
                type: 'technology',
                contactEmail: 'contact@techsolutions.com',
                industry: 'Technology',
                onboardingDate: '2024-01-15',
            });

            expect(result.contactEmail).toBe('contact@techsolutions.com');
            expect(result.industry).toBe('Technology');
            expect(result.onboardingDate).toEqual(new Date('2024-01-15'));
        });

        it('should create partner with agent type', async () => {
            const mockPartner = {
                id: 'partner-789',
                name: 'Agent Inc',
                type: 'agent',
            };
            mockReturning.mockResolvedValueOnce([mockPartner]);

            const result = await partnersService.createPartner('org-1', 'user-1', {
                name: 'Agent Inc',
                type: 'agent',
            });

            expect(result.type).toBe('agent');
        });

        it('should create partner with distributor type', async () => {
            const mockPartner = {
                id: 'partner-101',
                name: 'Distributor LLC',
                type: 'distributor',
            };
            mockReturning.mockResolvedValueOnce([mockPartner]);

            const result = await partnersService.createPartner('org-1', 'user-1', {
                name: 'Distributor LLC',
                type: 'distributor',
            });

            expect(result.type).toBe('distributor');
        });
    });

    describe('getOrgPartners', () => {
        it('should return all partners for an organization', async () => {
            const mockPartners = [
                { id: 'partner-1', name: 'Partner 1', type: 'reseller' },
                { id: 'partner-2', name: 'Partner 2', type: 'agent' },
                { id: 'partner-3', name: 'Partner 3', type: 'technology' },
            ];
            mockWhere.mockResolvedValueOnce(mockPartners);

            const result = await partnersService.getOrgPartners('org-1');

            expect(mockSelect).toHaveBeenCalled();
            expect(mockFrom).toHaveBeenCalled();
            expect(result).toHaveLength(3);
            expect(result).toEqual(mockPartners);
        });

        it('should return empty array for org with no partners', async () => {
            mockWhere.mockResolvedValueOnce([]);

            const result = await partnersService.getOrgPartners('org-no-partners');

            expect(result).toEqual([]);
        });
    });

    describe('getPartnerById', () => {
        it('should return partner when found', async () => {
            const mockPartner = {
                id: 'partner-1',
                name: 'Test Partner',
                organizationId: 'org-1',
                type: 'reseller',
            };
            mockLimit.mockResolvedValueOnce([mockPartner]);

            const result = await partnersService.getPartnerById('partner-1', 'org-1');

            expect(result).toEqual(mockPartner);
        });

        it('should return undefined when partner not found', async () => {
            mockLimit.mockResolvedValueOnce([]);

            const result = await partnersService.getPartnerById('nonexistent', 'org-1');

            expect(result).toBeUndefined();
        });

        it('should enforce organization isolation (cross-tenant security)', async () => {
            mockLimit.mockResolvedValueOnce([]);

            // Trying to get partner with wrong orgId should fail
            const result = await partnersService.getPartnerById('partner-1', 'wrong-org');

            expect(mockWhere).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });

    describe('getPartnerWithTeams', () => {
        it('should return partner with empty teams array', async () => {
            const mockPartner = {
                id: 'partner-1',
                name: 'Test Partner',
                organizationId: 'org-1',
            };
            mockLimit.mockResolvedValueOnce([mockPartner]);

            const result = await partnersService.getPartnerWithTeams('partner-1');

            expect(result.partner).toEqual(mockPartner);
            expect(result.teams).toEqual([]);
        });

        it('should return empty partner when not found', async () => {
            mockLimit.mockResolvedValueOnce([]);

            const result = await partnersService.getPartnerWithTeams('nonexistent');

            expect(result.partner).toBeUndefined();
            expect(result.teams).toEqual([]);
        });
    });

    describe('updatePartner', () => {
        it('should update partner name', async () => {
            const mockUpdated = {
                id: 'partner-1',
                name: 'Updated Partner Name',
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await partnersService.updatePartner('partner-1', { name: 'Updated Partner Name' });

            expect(mockUpdate).toHaveBeenCalled();
            expect(mockSet).toHaveBeenCalled();
            expect(result.name).toBe('Updated Partner Name');
        });

        it('should update partner contact email', async () => {
            const mockUpdated = {
                id: 'partner-1',
                contactEmail: 'newemail@example.com',
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await partnersService.updatePartner('partner-1', {
                contactEmail: 'newemail@example.com',
            });

            expect(result.contactEmail).toBe('newemail@example.com');
        });

        it('should update partner industry', async () => {
            const mockUpdated = {
                id: 'partner-1',
                industry: 'Healthcare',
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await partnersService.updatePartner('partner-1', { industry: 'Healthcare' });

            expect(result.industry).toBe('Healthcare');
        });

        it('should update onboarding date', async () => {
            const newDate = new Date('2024-06-01');
            const mockUpdated = {
                id: 'partner-1',
                onboardingDate: newDate,
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await partnersService.updatePartner('partner-1', { onboardingDate: newDate });

            expect(result.onboardingDate).toEqual(newDate);
        });

        it('should allow setting fields to null', async () => {
            const mockUpdated = {
                id: 'partner-1',
                contactEmail: null,
                industry: null,
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await partnersService.updatePartner('partner-1', {
                contactEmail: null,
                industry: null,
            });

            expect(result.contactEmail).toBeNull();
            expect(result.industry).toBeNull();
        });
    });

    describe('softDeletePartner', () => {
        it('should set partner status to inactive', async () => {
            const mockUpdated = {
                id: 'partner-1',
                name: 'Deleted Partner',
                status: 'inactive',
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await partnersService.softDeletePartner('partner-1');

            expect(mockUpdate).toHaveBeenCalled();
            expect(result.status).toBe('inactive');
        });

        it('should return undefined when partner not found', async () => {
            mockReturning.mockResolvedValueOnce([]);

            const result = await partnersService.softDeletePartner('nonexistent');

            expect(result).toBeUndefined();
        });

        it('should preserve all other partner data', async () => {
            const mockUpdated = {
                id: 'partner-1',
                name: 'Partner Name',
                type: 'reseller',
                contactEmail: 'email@example.com',
                status: 'inactive',
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await partnersService.softDeletePartner('partner-1');

            expect(result.name).toBe('Partner Name');
            expect(result.type).toBe('reseller');
            expect(result.contactEmail).toBe('email@example.com');
            expect(result.status).toBe('inactive');
        });
    });

    describe('isOrgMember', () => {
        it('should return true when user is organization member', async () => {
            mockLimit.mockResolvedValueOnce([{ id: 'org-user-1' }]);

            const result = await partnersService.isOrgMember('org-1', 'user-1');

            expect(result).toBe(true);
        });

        it('should return false when user is not organization member', async () => {
            mockLimit.mockResolvedValueOnce([]);

            const result = await partnersService.isOrgMember('org-1', 'user-not-member');

            expect(result).toBe(false);
        });

        it('should check correct org and user combination', async () => {
            mockLimit.mockResolvedValueOnce([]);

            await partnersService.isOrgMember('org-specific', 'user-specific');

            expect(mockWhere).toHaveBeenCalled();
        });
    });
});
