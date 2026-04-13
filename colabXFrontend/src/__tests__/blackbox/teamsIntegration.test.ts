/**
 * BLACKBOX TESTS: Teams Integration Tests
 * These tests verify the teams module behavior from an integration perspective,
 * treating the service layer as a black box and testing inputs/outputs.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

jest.unstable_mockModule('@/lib/api', () => ({
    API_BASE: '/api',
}));

const teamsService = await import('@/services/teamsService');

describe('Teams Module - Blackbox Integration Tests', () => {
    const orgId = 'test-org-123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Team Listing', () => {
        it('should successfully retrieve a list of teams', async () => {
            const expectedTeams = [
                { teamId: 't1', name: 'Revenue Team', memberCount: 4 },
                { teamId: 't2', name: 'Partner Success', memberCount: 2 },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ teams: expectedTeams }),
            } as Response);

            const result = await teamsService.getTeams(orgId);

            expect(result.teams).toHaveLength(2);
            expect(result.teams[0].name).toBe('Revenue Team');
            expect(result.teams[1].memberCount).toBe(2);
        });

        it('should return an empty list when no teams exist', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ teams: [] }),
            } as Response);

            const result = await teamsService.getTeams(orgId);

            expect(result.teams).toEqual([]);
        });

        it('should fail with the server error when listing is not allowed', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Access denied' }),
            } as Response);

            await expect(teamsService.getTeams(orgId)).rejects.toThrow('Access denied');
        });
    });

    describe('Team Creation', () => {
        it('should successfully create a team with a lead user', async () => {
            const input = {
                name: 'Launch Team',
                description: 'Handles strategic launches',
                leadUserId: 'user-lead',
                memberIds: ['user-2', 'user-3'],
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    team: { teamId: 'team-new', ...input, memberCount: 3 },
                }),
            } as Response);

            const result = await teamsService.createTeam(orgId, input);

            expect(result.team.teamId).toBe('team-new');
            expect(result.team.name).toBe('Launch Team');
            expect(result.team.memberCount).toBe(3);
        });

        it('should fail when team validation fails', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Team name is required' }),
            } as Response);

            await expect(
                teamsService.createTeam(orgId, { name: '', leadUserId: 'user-lead' })
            ).rejects.toThrow('Team name is required');
        });
    });

    describe('Team Details and Members', () => {
        it('should retrieve a team with its members', async () => {
            const members = [
                { teamMemberId: 'm1', userId: 'user-1', role: 'lead', userName: 'Asha' },
                { teamMemberId: 'm2', userId: 'user-2', role: 'member', userName: 'Dev' },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    team: { teamId: 'team-1', name: 'Revenue Team' },
                    members,
                }),
            } as Response);

            const result = await teamsService.getTeamById(orgId, 'team-1');

            expect(result.team.name).toBe('Revenue Team');
            expect(result.members).toHaveLength(2);
            expect(result.members[0].role).toBe('lead');
        });

        it('should add a member and return the created membership', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    member: { teamMemberId: 'm3', userId: 'user-3', role: 'member' },
                }),
            } as Response);

            const result = await teamsService.addTeamMember(
                orgId,
                'team-1',
                'user-3',
                'member'
            );

            expect(result.member.userId).toBe('user-3');
            expect(result.member.role).toBe('member');
        });

        it('should fail when adding a duplicate member', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'User is already a member of this team' }),
            } as Response);

            await expect(
                teamsService.addTeamMember(orgId, 'team-1', 'user-1', 'member')
            ).rejects.toThrow('User is already a member of this team');
        });
    });

    describe('Team Associations', () => {
        it('should retrieve partners assigned to a team', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    partners: [{ partnerId: 'p1', name: 'Acme Corp', status: 'active' }],
                }),
            } as Response);

            const result = await teamsService.getTeamPartners(orgId, 'team-1');

            expect(result.partners).toHaveLength(1);
            expect(result.partners[0].name).toBe('Acme Corp');
        });

        it('should retrieve deals owned by a team', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    deals: [{ dealId: 'd1', title: 'Expansion Deal', stage: 'proposal' }],
                }),
            } as Response);

            const result = await teamsService.getTeamDeals(orgId, 'team-1');

            expect(result.deals[0].title).toBe('Expansion Deal');
            expect(result.deals[0].stage).toBe('proposal');
        });
    });

    describe('API Contract', () => {
        it('should send organization ID and credentials with requests', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ teams: [] }),
            } as Response);

            await teamsService.getTeams(orgId);

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
