/**
 * WHITEBOX TESTS: Teams Service
 * These unit tests verify the internal logic of the teams service functions
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
const mockOrderBy = jest.fn();

// Chain methods
mockSelect.mockReturnValue({ from: mockFrom });
mockFrom.mockReturnValue({
    where: mockWhere,
    leftJoin: mockLeftJoin,
    innerJoin: mockInnerJoin,
    groupBy: mockGroupBy,
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
    orderBy: mockOrderBy,
});
mockLimit.mockResolvedValue([]);
mockGroupBy.mockResolvedValue([]);
mockInsert.mockReturnValue({ values: mockValues });
mockValues.mockReturnValue({ returning: mockReturning });
mockReturning.mockResolvedValue([]);
mockUpdate.mockReturnValue({ set: mockSet });
mockSet.mockReturnValue({ where: mockWhere });
mockDelete.mockReturnValue({ where: mockWhere });
mockOrderBy.mockReturnValue({ limit: mockLimit });

const mockDb = {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
    transaction: jest.fn(async (callback: (tx: typeof mockDb) => unknown) => callback(mockDb)),
};

jest.unstable_mockModule('../../db/index.js', () => ({
    default: mockDb,
}));

// Import after mocking
const teamsService = await import('../../teams/teams.service.js');

describe('Teams Service - Whitebox Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset chain methods
        mockSelect.mockReturnValue({ from: mockFrom });
        mockFrom.mockReturnValue({
            where: mockWhere,
            leftJoin: mockLeftJoin,
            innerJoin: mockInnerJoin,
            groupBy: mockGroupBy,
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
            orderBy: mockOrderBy,
        });
        mockLimit.mockResolvedValue([]);
        mockGroupBy.mockResolvedValue([]);
        mockInsert.mockReturnValue({ values: mockValues });
        mockValues.mockReturnValue({ returning: mockReturning });
        mockReturning.mockResolvedValue([]);
        mockUpdate.mockReturnValue({ set: mockSet });
        mockSet.mockReturnValue({ where: mockWhere });
        mockDelete.mockReturnValue({ where: mockWhere });
        mockOrderBy.mockReturnValue({ limit: mockLimit });
        mockDb.transaction.mockImplementation(async (callback: (tx: typeof mockDb) => unknown) => callback(mockDb));
    });

    describe('createTeam', () => {
        it('should create a team with required fields', async () => {
            const mockTeam = {
                id: 'team-123',
                organizationId: 'org-1',
                name: 'Test Team',
                description: null,
                createdByUserId: 'user-1',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockReturning.mockResolvedValueOnce([mockTeam]);

            const result = await teamsService.createTeam('org-1', 'user-1', { name: 'Test Team' });

            expect(mockInsert).toHaveBeenCalled();
            expect(mockValues).toHaveBeenCalled();
            expect(result.team).toEqual(mockTeam);
            expect(result.members).toEqual([]);
        });

        it('should create a team with optional description', async () => {
            const mockTeam = {
                id: 'team-456',
                organizationId: 'org-1',
                name: 'Test Team',
                description: 'Team description',
                createdByUserId: 'user-1',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockReturning.mockResolvedValueOnce([mockTeam]);

            const result = await teamsService.createTeam('org-1', 'user-1', {
                name: 'Test Team',
                description: 'Team description',
            });

            expect(result.team.description).toBe('Team description');
        });

        it('should handle empty description as null', async () => {
            const mockTeam = {
                id: 'team-789',
                organizationId: 'org-1',
                name: 'Test Team',
                description: null,
                createdByUserId: 'user-1',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockReturning.mockResolvedValueOnce([mockTeam]);

            const result = await teamsService.createTeam('org-1', 'user-1', {
                name: 'Test Team',
                description: undefined,
            });

            expect(result.team.description).toBeNull();
        });
    });

    describe('getOrgTeams', () => {
        it('should return teams with member count for an organization', async () => {
            const mockTeams = [
                { id: 'team-1', name: 'Team 1', memberCount: 3 },
                { id: 'team-2', name: 'Team 2', memberCount: 5 },
            ];
            mockOrderBy
                .mockResolvedValueOnce(mockTeams)
                .mockResolvedValueOnce([]);
            mockGroupBy
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            const result = await teamsService.getOrgTeams('org-1');

            expect(mockSelect).toHaveBeenCalled();
            expect(result).toEqual([
                {
                    ...mockTeams[0],
                    lead: null,
                    memberCount: 0,
                    partnerCount: 0,
                    dealCount: 0,
                    isActive: false,
                },
                {
                    ...mockTeams[1],
                    lead: null,
                    memberCount: 0,
                    partnerCount: 0,
                    dealCount: 0,
                    isActive: false,
                },
            ]);
        });

        it('should return empty array for org with no teams', async () => {
            mockOrderBy.mockResolvedValueOnce([]);

            const result = await teamsService.getOrgTeams('org-no-teams');

            expect(result).toEqual([]);
        });
    });

    describe('getTeamById', () => {
        it('should return team when found', async () => {
            const mockTeam = { id: 'team-1', name: 'Test Team', organizationId: 'org-1' };
            mockLimit.mockResolvedValueOnce([mockTeam]);

            const result = await teamsService.getTeamById('team-1', 'org-1');

            expect(result).toEqual(mockTeam);
        });

        it('should return undefined when team not found', async () => {
            mockLimit.mockResolvedValueOnce([]);

            const result = await teamsService.getTeamById('nonexistent', 'org-1');

            expect(result).toBeUndefined();
        });

        it('should enforce organization isolation', async () => {
            mockLimit.mockResolvedValueOnce([]);

            // Trying to get team with wrong orgId
            const result = await teamsService.getTeamById('team-1', 'wrong-org');

            expect(mockWhere).toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });

    describe('updateTeam', () => {
        it('should update team name', async () => {
            const mockUpdated = { id: 'team-1', name: 'Updated Name' };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await teamsService.updateTeam('team-1', { name: 'Updated Name' });

            expect(mockUpdate).toHaveBeenCalled();
            expect(mockSet).toHaveBeenCalled();
            expect(result).toEqual(mockUpdated);
        });

        it('should update team description', async () => {
            const mockUpdated = { id: 'team-1', description: 'New description' };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await teamsService.updateTeam('team-1', { description: 'New description' });

            expect(result.description).toBe('New description');
        });

        it('should allow setting description to null', async () => {
            const mockUpdated = { id: 'team-1', description: null };
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await teamsService.updateTeam('team-1', { description: null });

            expect(result.description).toBeNull();
        });
    });

    describe('deleteTeam', () => {
        it('should delete team and return deleted record', async () => {
            const mockDeleted = { id: 'team-1', name: 'Deleted Team' };
            mockReturning.mockResolvedValueOnce([mockDeleted]);

            const result = await teamsService.deleteTeam('team-1');

            expect(mockDelete).toHaveBeenCalled();
            expect(result).toEqual(mockDeleted);
        });

        it('should return undefined when team does not exist', async () => {
            mockReturning.mockResolvedValueOnce([]);

            const result = await teamsService.deleteTeam('nonexistent');

            expect(result).toBeUndefined();
        });
    });

    describe('isOrgMember', () => {
        it('should return true when user is org member', async () => {
            mockLimit.mockResolvedValueOnce([{ id: 'membership-1' }]);

            const result = await teamsService.isOrgMember('org-1', 'user-1');

            expect(result).toBe(true);
        });

        it('should return false when user is not org member', async () => {
            mockLimit.mockResolvedValueOnce([]);

            const result = await teamsService.isOrgMember('org-1', 'user-not-member');

            expect(result).toBe(false);
        });
    });

    describe('addTeamMember', () => {
        it('should add member with lead role', async () => {
            const mockMember = {
                id: 'member-1',
                teamId: 'team-1',
                userId: 'user-1',
                role: 'lead',
            };
            mockReturning.mockResolvedValueOnce([mockMember]);

            const result = await teamsService.addTeamMember('team-1', 'user-1', 'lead');

            expect(result.role).toBe('lead');
        });

        it('should add member with member role', async () => {
            const mockMember = {
                id: 'member-2',
                teamId: 'team-1',
                userId: 'user-2',
                role: 'member',
            };
            mockReturning.mockResolvedValueOnce([mockMember]);

            const result = await teamsService.addTeamMember('team-1', 'user-2', 'member');

            expect(result.role).toBe('member');
        });
    });

    describe('getTeamMemberRecord', () => {
        it('should return member record when exists', async () => {
            const mockMember = { id: 'member-1', teamId: 'team-1', userId: 'user-1' };
            mockLimit.mockResolvedValueOnce([mockMember]);

            const result = await teamsService.getTeamMemberRecord('team-1', 'user-1');

            expect(result).toEqual(mockMember);
        });

        it('should return undefined when member not found', async () => {
            mockLimit.mockResolvedValueOnce([]);

            const result = await teamsService.getTeamMemberRecord('team-1', 'user-not-member');

            expect(result).toBeUndefined();
        });
    });

    describe('updateTeamMemberRole', () => {
        it('should update role from member to lead', async () => {
            const mockUpdated = { id: 'member-1', role: 'lead' };
            mockLimit.mockResolvedValueOnce([{ id: 'member-1', role: 'member' }]);
            mockReturning.mockResolvedValueOnce([mockUpdated]);

            const result = await teamsService.updateTeamMemberRole('team-1', 'user-1', 'lead');

            expect(result.role).toBe('lead');
        });

        it('should update role from lead to member', async () => {
            mockLimit.mockResolvedValueOnce([{ id: 'member-1', role: 'member' }]);
            mockReturning.mockResolvedValueOnce([{ id: 'member-1', role: 'member' }]);

            const result = await teamsService.updateTeamMemberRole('team-1', 'user-1', 'member');

            expect(result?.role).toBe('member');
        });
    });

    describe('removeTeamMember', () => {
        it('should remove member and return deleted record', async () => {
            const mockDeleted = [{ id: 'member-1', userId: 'user-1' }];
            mockLimit.mockResolvedValueOnce([{ id: 'member-1', userId: 'user-1', role: 'member' }]);
            mockReturning.mockResolvedValueOnce(mockDeleted);

            const result = await teamsService.removeTeamMember('team-1', 'user-1');

            expect(mockDelete).toHaveBeenCalled();
            expect(result).toEqual(mockDeleted);
        });
    });

    describe('getTeamMemberUserIds', () => {
        it('should return array of user IDs', async () => {
            const mockMembers = [
                { userId: 'user-1' },
                { userId: 'user-2' },
                { userId: 'user-3' },
            ];
            mockWhere.mockResolvedValueOnce(mockMembers);

            const result = await teamsService.getTeamMemberUserIds('team-1');

            expect(result).toEqual(['user-1', 'user-2', 'user-3']);
        });

        it('should return empty array for team with no members', async () => {
            mockWhere.mockResolvedValueOnce([]);

            const result = await teamsService.getTeamMemberUserIds('team-no-members');

            expect(result).toEqual([]);
        });
    });

    describe('getTeamPartners', () => {
        it('should return empty array when team has no members', async () => {
            mockOrderBy.mockResolvedValueOnce([]);

            const result = await teamsService.getTeamPartners('team-no-members', 'org-1');

            expect(result).toEqual([]);
        });
    });

    describe('getTeamDeals', () => {
        it('should return empty array when team has no members', async () => {
            mockGroupBy.mockReturnValueOnce({ orderBy: mockOrderBy });
            mockOrderBy.mockResolvedValueOnce([]);

            const result = await teamsService.getTeamDeals('team-no-members', 'org-1');

            expect(result).toEqual([]);
        });
    });

    describe('getTeamObjectives', () => {
        it('should return empty array when team has no members', async () => {
            mockWhere
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            const result = await teamsService.getTeamObjectives('team-no-members', 'org-1');

            expect(result).toEqual([]);
        });
    });

    describe('getTeamActivity', () => {
        it('should return empty array when team has no members', async () => {
            mockWhere
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);
            mockGroupBy.mockReturnValueOnce({ orderBy: mockOrderBy });
            mockOrderBy.mockResolvedValueOnce([]);

            const result = await teamsService.getTeamActivity('team-no-members', 'org-1');

            expect(result).toEqual([]);
        });
    });
});
