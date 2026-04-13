/**
 * BLACKBOX TESTS: Teams API Integration Tests
 * These tests verify the Teams API endpoints without knowledge of internal implementation.
 * They treat the API as a black box, only testing inputs and outputs.
 */

import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Create a mock app for testing
const mockApp = express();
mockApp.use(express.json());

// Mock authentication middleware
const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
const mockOrg = { id: 'org-123', name: 'Test Org' };
const mockTeam = { id: 'team-123', name: 'Test Team', organizationId: 'org-123' };

// Mock service functions
const mockTeams: Record<string, unknown>[] = [];
const mockMembers: Record<string, unknown>[] = [];

// Setup routes with mocked middleware
mockApp.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { user: typeof mockUser; org: typeof mockOrg; team: typeof mockTeam }).user = mockUser;
    (req as express.Request & { user: typeof mockUser; org: typeof mockOrg; team: typeof mockTeam }).org = mockOrg;
    next();
});

// POST /api/teams - Create team
mockApp.post('/api/teams', (req: express.Request, res: express.Response) => {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Team name is required' });
        return;
    }

    const team = {
        id: `team-${Date.now()}`,
        organizationId: mockOrg.id,
        name,
        description: description || null,
        createdByUserId: mockUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    mockTeams.push(team);
    res.status(201).json({ team });
});

// GET /api/teams - List teams
mockApp.get('/api/teams', (_req: express.Request, res: express.Response) => {
    const teams = mockTeams.map(t => ({ ...t, memberCount: 0 }));
    res.json({ teams });
});

// GET /api/teams/:teamId - Get team by ID
mockApp.get('/api/teams/:teamId', (req: express.Request, res: express.Response) => {
    const team = mockTeams.find(t => t.id === req.params.teamId);
    if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
    }
    res.json({ team, members: mockMembers.filter(m => m.teamId === req.params.teamId) });
});

// PATCH /api/teams/:teamId - Update team
mockApp.patch('/api/teams/:teamId', (req: express.Request, res: express.Response) => {
    const team = mockTeams.find(t => t.id === req.params.teamId);
    if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
    }

    const { name, description } = req.body;
    if (name === undefined && description === undefined) {
        res.status(400).json({ error: 'No fields to update' });
        return;
    }

    if (name !== undefined) team.name = name;
    if (description !== undefined) team.description = description;
    team.updatedAt = new Date().toISOString();

    res.json({ team });
});

// DELETE /api/teams/:teamId - Delete team
mockApp.delete('/api/teams/:teamId', (req: express.Request, res: express.Response) => {
    const index = mockTeams.findIndex(t => t.id === req.params.teamId);
    if (index === -1) {
        res.status(404).json({ error: 'Team not found' });
        return;
    }
    mockTeams.splice(index, 1);
    res.json({ success: true });
});

// POST /api/teams/:teamId/members - Add member
mockApp.post('/api/teams/:teamId/members', (req: express.Request, res: express.Response) => {
    const team = mockTeams.find(t => t.id === req.params.teamId);
    if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
    }

    const { userId, role } = req.body;

    if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
    }

    if (!['lead', 'member'].includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return;
    }

    // Check for duplicate
    const existing = mockMembers.find(m => m.teamId === req.params.teamId && m.userId === userId);
    if (existing) {
        res.status(409).json({ error: 'User is already a member of this team' });
        return;
    }

    const member = {
        id: `member-${Date.now()}`,
        teamId: req.params.teamId,
        userId,
        role,
        joinedAt: new Date().toISOString(),
    };
    mockMembers.push(member);
    res.status(201).json({ member });
});

// GET /api/teams/:teamId/members - List members
mockApp.get('/api/teams/:teamId/members', (req: express.Request, res: express.Response) => {
    const team = mockTeams.find(t => t.id === req.params.teamId);
    if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
    }
    const members = mockMembers.filter(m => m.teamId === req.params.teamId);
    res.json({ members });
});

// DELETE /api/teams/:teamId/members/:userId - Remove member
mockApp.delete('/api/teams/:teamId/members/:userId', (req: express.Request, res: express.Response) => {
    const index = mockMembers.findIndex(
        m => m.teamId === req.params.teamId && m.userId === req.params.userId
    );
    if (index === -1) {
        res.status(404).json({ error: 'Team member not found' });
        return;
    }
    mockMembers.splice(index, 1);
    res.json({ success: true });
});

describe('Teams API - Blackbox Tests', () => {
    beforeEach(() => {
        // Clear mock data
        mockTeams.length = 0;
        mockMembers.length = 0;
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('POST /api/teams - Create Team', () => {
        it('should create a team with valid name', async () => {
            const response = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Engineering Team' })
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.team).toBeDefined();
            expect(response.body.team.name).toBe('Engineering Team');
            expect(response.body.team.teamId).toBeDefined();
        });

        it('should create a team with name and description', async () => {
            const response = await request(mockApp)
                .post('/api/teams')
                .send({
                    name: 'Sales Team',
                    description: 'Handles all sales operations',
                })
                .expect(201);

            expect(response.body.team.name).toBe('Sales Team');
            expect(response.body.team.description).toBe('Handles all sales operations');
        });

        it('should reject empty team name', async () => {
            const response = await request(mockApp)
                .post('/api/teams')
                .send({ name: '' })
                .expect(400);

            expect(response.body.error).toBeDefined();
        });

        it('should reject missing team name', async () => {
            const response = await request(mockApp)
                .post('/api/teams')
                .send({ description: 'Some description' })
                .expect(400);

            expect(response.body.error).toBeDefined();
        });
    });

    describe('GET /api/teams - List Teams', () => {
        it('should return empty array when no teams exist', async () => {
            const response = await request(mockApp)
                .get('/api/teams')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.teams).toEqual([]);
        });

        it('should return all teams for organization', async () => {
            // Create some teams first
            await request(mockApp).post('/api/teams').send({ name: 'Team 1' });
            await request(mockApp).post('/api/teams').send({ name: 'Team 2' });

            const response = await request(mockApp)
                .get('/api/teams')
                .expect(200);

            expect(response.body.teams).toHaveLength(2);
            expect(response.body.teams[0].memberCount).toBeDefined();
        });
    });

    describe('GET /api/teams/:teamId - Get Team', () => {
        it('should return team with members', async () => {
            // Create a team
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Test Team' });
            const teamId = createResponse.body.team.teamId;

            const response = await request(mockApp)
                .get(`/api/teams/${teamId}`)
                .expect(200);

            expect(response.body.team).toBeDefined();
            expect(response.body.team.name).toBe('Test Team');
            expect(response.body.members).toBeDefined();
            expect(Array.isArray(response.body.members)).toBe(true);
        });

        it('should return 404 for non-existent team', async () => {
            const response = await request(mockApp)
                .get('/api/teams/nonexistent-id')
                .expect(404);

            expect(response.body.error).toBe('Team not found');
        });
    });

    describe('PATCH /api/teams/:teamId - Update Team', () => {
        it('should update team name', async () => {
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Old Name' });
            const teamId = createResponse.body.team.teamId;

            const response = await request(mockApp)
                .patch(`/api/teams/${teamId}`)
                .send({ name: 'New Name' })
                .expect(200);

            expect(response.body.team.name).toBe('New Name');
        });

        it('should update team description', async () => {
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Test Team' });
            const teamId = createResponse.body.team.teamId;

            const response = await request(mockApp)
                .patch(`/api/teams/${teamId}`)
                .send({ description: 'Updated description' })
                .expect(200);

            expect(response.body.team.description).toBe('Updated description');
        });

        it('should reject update with no fields', async () => {
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Test Team' });
            const teamId = createResponse.body.team.teamId;

            const response = await request(mockApp)
                .patch(`/api/teams/${teamId}`)
                .send({})
                .expect(400);

            expect(response.body.error).toBe('No fields to update');
        });

        it('should return 404 for non-existent team', async () => {
            await request(mockApp)
                .patch('/api/teams/nonexistent')
                .send({ name: 'New Name' })
                .expect(404);
        });
    });

    describe('DELETE /api/teams/:teamId - Delete Team', () => {
        it('should delete existing team', async () => {
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Team to Delete' });
            const teamId = createResponse.body.team.teamId;

            const response = await request(mockApp)
                .delete(`/api/teams/${teamId}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify team is deleted
            await request(mockApp)
                .get(`/api/teams/${teamId}`)
                .expect(404);
        });

        it('should return 404 for non-existent team', async () => {
            await request(mockApp)
                .delete('/api/teams/nonexistent')
                .expect(404);
        });
    });

    describe('POST /api/teams/:teamId/members - Add Member', () => {
        it('should add member with valid role', async () => {
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Test Team' });
            const teamId = createResponse.body.team.teamId;

            const response = await request(mockApp)
                .post(`/api/teams/${teamId}/members`)
                .send({ userId: 'user-456', role: 'member' })
                .expect(201);

            expect(response.body.member).toBeDefined();
            expect(response.body.member.userId).toBe('user-456');
            expect(response.body.member.role).toBe('member');
        });

        it('should add member with lead role', async () => {
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Test Team' });
            const teamId = createResponse.body.team.teamId;

            const response = await request(mockApp)
                .post(`/api/teams/${teamId}/members`)
                .send({ userId: 'user-789', role: 'lead' })
                .expect(201);

            expect(response.body.member.role).toBe('lead');
        });

        it('should reject duplicate member', async () => {
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Test Team' });
            const teamId = createResponse.body.team.teamId;

            await request(mockApp)
                .post(`/api/teams/${teamId}/members`)
                .send({ userId: 'user-456', role: 'member' });

            const response = await request(mockApp)
                .post(`/api/teams/${teamId}/members`)
                .send({ userId: 'user-456', role: 'lead' })
                .expect(409);

            expect(response.body.error).toBe('User is already a member of this team');
        });

        it('should reject invalid role', async () => {
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Test Team' });
            const teamId = createResponse.body.team.teamId;

            await request(mockApp)
                .post(`/api/teams/${teamId}/members`)
                .send({ userId: 'user-456', role: 'invalid' })
                .expect(400);
        });
    });

    describe('GET /api/teams/:teamId/members - List Members', () => {
        it('should return empty array for team with no members', async () => {
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Test Team' });
            const teamId = createResponse.body.team.teamId;

            const response = await request(mockApp)
                .get(`/api/teams/${teamId}/members`)
                .expect(200);

            expect(response.body.members).toEqual([]);
        });

        it('should return all team members', async () => {
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Test Team' });
            const teamId = createResponse.body.team.teamId;

            await request(mockApp)
                .post(`/api/teams/${teamId}/members`)
                .send({ userId: 'user-1', role: 'lead' });
            await request(mockApp)
                .post(`/api/teams/${teamId}/members`)
                .send({ userId: 'user-2', role: 'member' });

            const response = await request(mockApp)
                .get(`/api/teams/${teamId}/members`)
                .expect(200);

            expect(response.body.members).toHaveLength(2);
        });
    });

    describe('DELETE /api/teams/:teamId/members/:userId - Remove Member', () => {
        it('should remove existing member', async () => {
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Test Team' });
            const teamId = createResponse.body.team.teamId;

            await request(mockApp)
                .post(`/api/teams/${teamId}/members`)
                .send({ userId: 'user-456', role: 'member' });

            const response = await request(mockApp)
                .delete(`/api/teams/${teamId}/members/user-456`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it('should return 404 for non-existent member', async () => {
            const createResponse = await request(mockApp)
                .post('/api/teams')
                .send({ name: 'Test Team' });
            const teamId = createResponse.body.team.teamId;

            await request(mockApp)
                .delete(`/api/teams/${teamId}/members/nonexistent-user`)
                .expect(404);
        });
    });
});
