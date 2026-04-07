/**
 * WHITEBOX TESTS: Deals Service
 * These unit tests verify the internal logic of the deals service functions
 * by mocking the database layer and testing with knowledge of the implementation.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the database module
const mockSelect = jest.fn();
const mockFrom = jest.fn();
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockGroupBy = jest.fn();
const mockInsert = jest.fn();
const mockValues = jest.fn();
const mockReturning = jest.fn();
const mockUpdate = jest.fn();
const mockSet = jest.fn();
const mockDelete = jest.fn();
const mockLeftJoin = jest.fn();
const mockInnerJoin = jest.fn();

// Chain methods
mockSelect.mockReturnValue({ from: mockFrom });
mockFrom.mockReturnValue({
    where: mockWhere,
    leftJoin: mockLeftJoin,
    innerJoin: mockInnerJoin,
});
mockLeftJoin.mockReturnValue({
    where: mockWhere,
    leftJoin: mockLeftJoin,
    groupBy: mockGroupBy,
});
mockInnerJoin.mockReturnValue({ where: mockWhere });
mockWhere.mockReturnValue({
    limit: mockLimit,
    groupBy: mockGroupBy,
    returning: mockReturning,
});
mockLimit.mockResolvedValue([]);
mockGroupBy.mockResolvedValue([]);
mockInsert.mockReturnValue({ values: mockValues });
mockValues.mockReturnValue({ returning: mockReturning });
mockReturning.mockResolvedValue([]);
mockUpdate.mockReturnValue({ set: mockSet });
mockSet.mockReturnValue({ where: mockWhere });
mockDelete.mockReturnValue({ where: mockWhere });

jest.unstable_mockModule('../../db/index.js', () => ({
    default: {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
    },
}));

// Import after mocking
const dealsService = await import('../../deals/deals.service.js');

describe('Deals Service - Whitebox Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset chain methods
        mockSelect.mockReturnValue({ from: mockFrom });
        mockFrom.mockReturnValue({
            where: mockWhere,
            leftJoin: mockLeftJoin,
            innerJoin: mockInnerJoin,
        });
        mockLeftJoin.mockReturnValue({
            where: mockWhere,
            leftJoin: mockLeftJoin,
            groupBy: mockGroupBy,
        });
        mockInnerJoin.mockReturnValue({ where: mockWhere });
        mockWhere.mockReturnValue({
            limit: mockLimit,
            groupBy: mockGroupBy,
            returning: mockReturning,
        });
        mockLimit.mockResolvedValue([]);
        mockGroupBy.mockResolvedValue([]);
        mockInsert.mockReturnValue({ values: mockValues });
        mockValues.mockReturnValue({ returning: mockReturning });
        mockReturning.mockResolvedValue([]);
        mockUpdate.mockReturnValue({ set: mockSet });
        mockSet.mockReturnValue({ where: mockWhere });
        mockDelete.mockReturnValue({ where: mockWhere });
    });

    describe('createDeal', () => {
        it('should create a deal with required fields', async () => {
            const mockDeal = {
                id: 'deal-123',
                orgId: 'org-1',
                partnerId: 'partner-1',
                title: 'Enterprise License',
                description: null,
                value: null,
                stage: 'lead',
                createdBy: 'user-1',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockReturning.mockResolvedValueOnce([mockDeal]);

            const result = await dealsService.createDeal('org-1', 'user-1', {
                partnerId: 'partner-1',
                teamId: 'team-1',
                title: 'Enterprise License',
            });

            expect(mockInsert).toHaveBeenCalled();
            expect(result).toEqual(mockDeal);
            expect(result.title).toBe('Enterprise License');
            expect(result.stage).toBe('lead');
        });

        it('should create a deal with description', async () => {
            const mockDeal = {
                id: 'deal-456',
                title: 'Cloud Migration',
                description: 'Full cloud migration project',
            };
            mockReturning.mockResolvedValueOnce([mockDeal]);

            const result = await dealsService.createDeal('org-1', 'user-1', {
                partnerId: 'partner-1',
                teamId: 'team-1',
                title: 'Cloud Migration',
                description: 'Full cloud migration project',
            });

            expect(result.description).toBe('Full cloud migration project');
        });

        it('should create a deal with value', async () => {
            const mockDeal = {
                id: 'deal-789',
                title: 'Big Deal',
                value: 50000,
            };
            mockReturning.mockResolvedValueOnce([mockDeal]);

            const result = await dealsService.createDeal('org-1', 'user-1', {
                partnerId: 'partner-1',
                teamId: 'team-1',
                title: 'Big Deal',
                value: 50000,
            });

            expect(result.value).toBe(50000);
        });

        it('should handle zero value deals', async () => {
            const mockDeal = {
                id: 'deal-101',
                title: 'Free Trial',
                value: 0,
            };
            mockReturning.mockResolvedValueOnce([mockDeal]);

            const result = await dealsService.createDeal('org-1', 'user-1', {
                partnerId: 'partner-1',
                teamId: 'team-1',
                title: 'Free Trial',
                value: 0,
            });

            expect(result.value).toBe(0);
        });
    });

    describe('getOrgDeals', () => {
        it('should return all deals for an organization', async () => {
            const mockDeals = [
                { id: 'deal-1', title: 'Deal 1', stage: 'lead' },
                { id: 'deal-2', title: 'Deal 2', stage: 'proposal' },
                { id: 'deal-3', title: 'Deal 3', stage: 'won' },
            ];
            mockGroupBy.mockResolvedValueOnce(mockDeals);

            const result = await dealsService.getOrgDeals('org-1');

            expect(result).toHaveLength(3);
        });

        it('should filter by stage', async () => {
            const mockDeals = [
                { id: 'deal-1', title: 'Deal 1', stage: 'proposal' },
            ];
            mockGroupBy.mockResolvedValueOnce(mockDeals);

            const result = await dealsService.getOrgDeals('org-1', { stage: 'proposal' });

            expect(result).toHaveLength(1);
            expect(result[0]?.stage).toBe('proposal');
        });

        it('should filter by partnerId', async () => {
            const mockDeals = [
                { id: 'deal-1', title: 'Deal 1', partnerId: 'partner-1' },
            ];
            mockGroupBy.mockResolvedValueOnce(mockDeals);

            const result = await dealsService.getOrgDeals('org-1', { partnerId: 'partner-1' });

            expect(result).toHaveLength(1);
        });

        it('should return empty array for org with no deals', async () => {
            mockGroupBy.mockResolvedValueOnce([]);

            const result = await dealsService.getOrgDeals('org-no-deals');

            expect(result).toEqual([]);
        });
    });

    describe('getDealById', () => {
        it('should return deal when found', async () => {
            const mockDeal = {
                id: 'deal-1',
                title: 'Test Deal',
                orgId: 'org-1',
                stage: 'negotiation',
            };
            mockLimit.mockResolvedValueOnce([mockDeal]);

            const result = await dealsService.getDealById('deal-1', 'org-1');

            expect(result).toEqual(mockDeal);
        });

        it('should return undefined when deal not found', async () => {
            mockLimit.mockResolvedValueOnce([]);

            const result = await dealsService.getDealById('nonexistent', 'org-1');

            expect(result).toBeUndefined();
        });

        it('should enforce organization isolation', async () => {
            mockLimit.mockResolvedValueOnce([]);

            const result = await dealsService.getDealById('deal-1', 'wrong-org');

            expect(result).toBeUndefined();
        });
    });

    describe('getDealWithDetails', () => {
        it('should return deal with assignments and partner info', async () => {
            const mockDeal = {
                id: 'deal-1',
                title: 'Test Deal',
                partnerId: 'partner-1',
            };
            mockLimit.mockResolvedValueOnce([mockDeal]); // Deal query
            mockLimit.mockResolvedValueOnce([{ id: 'partner-1', name: 'Partner Corp' }]); // Partner query
            mockWhere
                .mockReturnValueOnce({
                    limit: mockLimit,
                    groupBy: mockGroupBy,
                    returning: mockReturning,
                })
                .mockResolvedValueOnce([
                    { id: 'assign-1', userId: 'user-1', userName: 'John' },
                ]); // Assignments query

            const result = await dealsService.getDealWithDetails('deal-1');

            expect(result.deal).toEqual(mockDeal);
            expect(result.activities).toEqual([]);
        });

        it('should handle deal without partner', async () => {
            mockLimit.mockResolvedValueOnce([{ id: 'deal-1', partnerId: null }]);
            mockLimit.mockResolvedValueOnce([]);
            mockWhere
                .mockReturnValueOnce({
                    limit: mockLimit,
                    groupBy: mockGroupBy,
                    returning: mockReturning,
                })
                .mockResolvedValueOnce([]);

            const result = await dealsService.getDealWithDetails('deal-1');

            expect(result.partner).toBeNull();
        });

        it('should return empty when deal not found', async () => {
            mockLimit.mockResolvedValueOnce([]);

            const result = await dealsService.getDealWithDetails('nonexistent');

            expect(result.deal).toBeUndefined();
        });
    });

    describe('updateDeal', () => {
        it('should update deal title', async () => {
            const mockUpdated = {
                id: 'deal-1',
                title: 'Updated Title',
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await dealsService.updateDeal('deal-1', { title: 'Updated Title' });

            expect(result.title).toBe('Updated Title');
        });

        it('should update deal value', async () => {
            const mockUpdated = {
                id: 'deal-1',
                value: 75000,
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await dealsService.updateDeal('deal-1', { value: 75000 });

            expect(result.value).toBe(75000);
        });

        it('should update deal stage to proposal', async () => {
            const mockUpdated = {
                id: 'deal-1',
                stage: 'proposal',
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await dealsService.updateDeal('deal-1', { stage: 'proposal' });

            expect(result.stage).toBe('proposal');
        });

        it('should update deal stage to negotiation', async () => {
            const mockUpdated = {
                id: 'deal-1',
                stage: 'negotiation',
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await dealsService.updateDeal('deal-1', { stage: 'negotiation' });

            expect(result.stage).toBe('negotiation');
        });

        it('should update deal stage to won', async () => {
            const mockUpdated = {
                id: 'deal-1',
                stage: 'won',
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await dealsService.updateDeal('deal-1', { stage: 'won' });

            expect(result.stage).toBe('won');
        });

        it('should allow setting description to null', async () => {
            const mockUpdated = {
                id: 'deal-1',
                description: null,
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await dealsService.updateDeal('deal-1', { description: null });

            expect(result.description).toBeNull();
        });
    });

    describe('softDeleteDeal', () => {
        it('should set deal stage to lost', async () => {
            const mockUpdated = {
                id: 'deal-1',
                title: 'Lost Deal',
                stage: 'lost',
            };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await dealsService.softDeleteDeal('deal-1');

            expect(result.stage).toBe('lost');
        });

        it('should return undefined when deal not found', async () => {
            mockReturning.mockResolvedValueOnce([]);

            const result = await dealsService.softDeleteDeal('nonexistent');

            expect(result).toBeUndefined();
        });
    });

    describe('getDealAssignmentRecord', () => {
        it('should return assignment when exists', async () => {
            const mockAssignment = {
                id: 'assignment-1',
                dealId: 'deal-1',
                userId: 'user-1',
            };
            mockLimit.mockResolvedValueOnce([mockAssignment]);

            const result = await dealsService.getDealAssignmentRecord('deal-1', 'user-1');

            expect(result).toEqual(mockAssignment);
        });

        it('should return undefined when assignment not found', async () => {
            mockLimit.mockResolvedValueOnce([]);

            const result = await dealsService.getDealAssignmentRecord('deal-1', 'user-not-assigned');

            expect(result).toBeUndefined();
        });
    });

    describe('assignUserToDeal', () => {
        it('should create deal assignment', async () => {
            const mockAssignment = {
                id: 'assignment-1',
                dealId: 'deal-1',
                userId: 'user-1',
                assignedAt: new Date(),
            };
            mockReturning.mockResolvedValueOnce([mockAssignment]);

            const result = await dealsService.assignUserToDeal('deal-1', 'user-1');

            expect(mockInsert).toHaveBeenCalled();
            expect(result.dealId).toBe('deal-1');
            expect(result.userId).toBe('user-1');
        });
    });

    describe('getDealAssignments', () => {
        it('should return all assignments for a deal', async () => {
            const mockAssignments = [
                { id: 'a1', userId: 'user-1', userName: 'John' },
                { id: 'a2', userId: 'user-2', userName: 'Jane' },
            ];
            mockWhere.mockResolvedValueOnce(mockAssignments);

            const result = await dealsService.getDealAssignments('deal-1');

            expect(result).toHaveLength(2);
        });

        it('should return empty array when no assignments', async () => {
            mockWhere.mockResolvedValueOnce([]);

            const result = await dealsService.getDealAssignments('deal-no-assignments');

            expect(result).toEqual([]);
        });
    });

    describe('removeUserFromDeal', () => {
        it('should remove assignment and return deleted record', async () => {
            const mockDeleted = [{ id: 'assignment-1', userId: 'user-1' }];
            mockReturning.mockResolvedValueOnce(mockDeleted);

            const result = await dealsService.removeUserFromDeal('deal-1', 'user-1');

            expect(mockDelete).toHaveBeenCalled();
            expect(result).toEqual(mockDeleted);
        });

        it('should return empty array when assignment not found', async () => {
            mockReturning.mockResolvedValueOnce([]);

            const result = await dealsService.removeUserFromDeal('deal-1', 'user-not-assigned');

            expect(result).toEqual([]);
        });
    });

    describe('isOrgMember', () => {
        it('should return true when user is org member', async () => {
            mockLimit.mockResolvedValueOnce([{ id: 'org-user-1' }]);

            const result = await dealsService.isOrgMember('org-1', 'user-1');

            expect(result).toBe(true);
        });

        it('should return false when user is not org member', async () => {
            mockLimit.mockResolvedValueOnce([]);

            const result = await dealsService.isOrgMember('org-1', 'user-not-member');

            expect(result).toBe(false);
        });
    });

    describe('getPartnerByIdForOrg', () => {
        it('should return partner when found in org', async () => {
            const mockPartner = {
                id: 'partner-1',
                name: 'Partner Corp',
                orgId: 'org-1',
            };
            mockLimit.mockResolvedValueOnce([mockPartner]);

            const result = await dealsService.getPartnerByIdForOrg('partner-1', 'org-1');

            expect(result).toEqual(mockPartner);
        });

        it('should return undefined when partner not in org', async () => {
            mockLimit.mockResolvedValueOnce([]);

            const result = await dealsService.getPartnerByIdForOrg('partner-1', 'wrong-org');

            expect(result).toBeUndefined();
        });
    });
});
