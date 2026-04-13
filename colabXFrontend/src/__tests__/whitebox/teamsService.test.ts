/**
 * WHITEBOX TESTS: Teams Service
 * These unit tests verify the internal logic of the teams service functions
 * by mocking fetch and testing with knowledge of the implementation.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the API_BASE
jest.unstable_mockModule('@/lib/api', () => ({
    API_BASE: 'http://localhost:3000/api',
}));

// Import after mocking
const teamsService = await import('@/services/teamsService');

describe('Teams Service - Whitebox Tests', () => {
    const mockOrgId = 'org-123';
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTeams', () => {
        it('should fetch teams with correct headers', async () => {
            const mockTeams = [
                { id: 't1', name: 'Team 1', memberCount: 5 },
                { id: 't2', name: 'Team 2', memberCount: 3 },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ teams: mockTeams }),
            } as Response);

            const result = await teamsService.getTeams(mockOrgId);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams',
                expect.objectContaining({
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-org-id': mockOrgId,
                    },
                })
            );
            expect(result.teams).toEqual(mockTeams);
        });

        it('should throw error when response is not ok', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Access denied' }),
            } as Response);

            await expect(teamsService.getTeams(mockOrgId))
                .rejects
                .toThrow('Access denied');
        });
    });

    describe('getTeamById', () => {
        it('should fetch team by ID with members', async () => {
            const mockTeam = { id: 'team-1', name: 'Test Team', description: 'Test' };
            const mockMembers = [
                { id: 'm1', userId: 'u1', role: 'lead', userName: 'John' },
                { id: 'm2', userId: 'u2', role: 'member', userName: 'Jane' },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ team: mockTeam, members: mockMembers }),
            } as Response);

            const result = await teamsService.getTeamById(mockOrgId, 'team-1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams/team-1',
                expect.objectContaining({
                    method: 'GET',
                })
            );
            expect(result.team).toEqual(mockTeam);
            expect(result.members).toHaveLength(2);
        });

        it('should throw error when team not found', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Team not found' }),
            } as Response);

            await expect(teamsService.getTeamById(mockOrgId, 'nonexistent'))
                .rejects
                .toThrow('Team not found');
        });
    });

    describe('createTeam', () => {
        it('should create team with name only', async () => {
            const input = { name: 'New Team', leadUserId: 'u-lead' };
            const mockCreated = { id: 'team-new', ...input, memberCount: 0 };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ team: mockCreated }),
            } as Response);

            const result = await teamsService.createTeam(mockOrgId, input);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(input),
                })
            );
            expect(result.team.name).toBe('New Team');
        });

        it('should create team with description', async () => {
            const input = {
                name: 'Full Team',
                description: 'A complete team',
                leadUserId: 'u-lead',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ team: { id: 't1', ...input } }),
            } as Response);

            const result = await teamsService.createTeam(mockOrgId, input);

            expect(result.team.description).toBe('A complete team');
        });
    });

    describe('updateTeam', () => {
        it('should update team name', async () => {
            const input = { name: 'Updated Team' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ team: { id: 't1', ...input } }),
            } as Response);

            const result = await teamsService.updateTeam(mockOrgId, 't1', input);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams/t1',
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify(input),
                })
            );
            expect(result.team.name).toBe('Updated Team');
        });

        it('should update team description', async () => {
            const input = { description: 'New description' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ team: { id: 't1', description: 'New description' } }),
            } as Response);

            const result = await teamsService.updateTeam(mockOrgId, 't1', input);

            expect(result.team.description).toBe('New description');
        });
    });

    describe('deleteTeam', () => {
        it('should delete team', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            const result = await teamsService.deleteTeam(mockOrgId, 't1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams/t1',
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
            expect(result.success).toBe(true);
        });
    });

    describe('getTeamMembers', () => {
        it('should fetch team members', async () => {
            const mockMembers = [
                { id: 'm1', userId: 'u1', role: 'lead' },
                { id: 'm2', userId: 'u2', role: 'member' },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ members: mockMembers }),
            } as Response);

            const result = await teamsService.getTeamMembers(mockOrgId, 'team-1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams/team-1/members',
                expect.any(Object)
            );
            expect(result.members).toHaveLength(2);
        });
    });

    describe('addTeamMember', () => {
        it('should add member with lead role', async () => {
            const mockMember = { id: 'm1', userId: 'u1', role: 'lead', teamId: 't1' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ member: mockMember }),
            } as Response);

            const result = await teamsService.addTeamMember(mockOrgId, 't1', 'u1', 'lead');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams/t1/members',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ userId: 'u1', role: 'lead' }),
                })
            );
            expect(result.member.role).toBe('lead');
        });

        it('should add member with member role', async () => {
            const mockMember = { id: 'm2', userId: 'u2', role: 'member', teamId: 't1' };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ member: mockMember }),
            } as Response);

            const result = await teamsService.addTeamMember(mockOrgId, 't1', 'u2', 'member');

            expect(result.member.role).toBe('member');
        });

        it('should throw error on duplicate member', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'User is already a member of this team' }),
            } as Response);

            await expect(teamsService.addTeamMember(mockOrgId, 't1', 'u1', 'member'))
                .rejects
                .toThrow('User is already a member of this team');
        });
    });

    describe('updateTeamMemberRole', () => {
        it('should update member role to lead', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ member: { id: 'm1', role: 'lead' } }),
            } as Response);

            const result = await teamsService.updateTeamMemberRole(mockOrgId, 't1', 'u1', 'lead');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams/t1/members/u1/role',
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify({ role: 'lead' }),
                })
            );
            expect(result.member.role).toBe('lead');
        });
    });

    describe('removeTeamMember', () => {
        it('should remove member from team', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            const result = await teamsService.removeTeamMember(mockOrgId, 't1', 'u1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams/t1/members/u1',
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
            expect(result.success).toBe(true);
        });
    });

    describe('getTeamPartners', () => {
        it('should fetch partners for team', async () => {
            const mockPartners = [
                { id: 'p1', name: 'Partner 1', type: 'reseller', status: 'active' },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ partners: mockPartners }),
            } as Response);

            const result = await teamsService.getTeamPartners(mockOrgId, 't1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams/t1/partners',
                expect.any(Object)
            );
            expect(result.partners).toHaveLength(1);
        });
    });

    describe('getTeamDeals', () => {
        it('should fetch deals for team', async () => {
            const mockDeals = [
                { id: 'd1', title: 'Deal 1', value: 50000, stage: 'proposal' },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ deals: mockDeals }),
            } as Response);

            const result = await teamsService.getTeamDeals(mockOrgId, 't1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams/t1/deals',
                expect.any(Object)
            );
            expect(result.deals).toHaveLength(1);
        });
    });

    describe('getTeamObjectives', () => {
        it('should fetch objectives for team', async () => {
            const mockObjectives = [
                { id: 'o1', title: 'Objective 1', progress: 50, status: 'on_track' },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ objectives: mockObjectives }),
            } as Response);

            const result = await teamsService.getTeamObjectives(mockOrgId, 't1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams/t1/objectives',
                expect.any(Object)
            );
            expect(result.objectives).toHaveLength(1);
        });
    });

    describe('getTeamActivity', () => {
        it('should fetch activity for team', async () => {
            const mockActivities = [
                { id: 'a1', action: 'created', entityType: 'deal', createdAt: '2024-01-01' },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ activities: mockActivities }),
            } as Response);

            const result = await teamsService.getTeamActivity(mockOrgId, 't1');

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/teams/t1/activity',
                expect.any(Object)
            );
            expect(result.activities).toHaveLength(1);
        });
    });
});
