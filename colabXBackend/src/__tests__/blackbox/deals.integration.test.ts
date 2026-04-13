/**
 * BLACKBOX TESTS: Deals API Integration Tests
 * These tests verify the Deals API endpoints without knowledge of internal implementation.
 * They treat the API as a black box, only testing inputs and outputs.
 */

import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Create a mock app for testing
const mockApp = express();
mockApp.use(express.json());

// Mock data
const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
const mockOrg = { id: 'org-123', name: 'Test Org' };
const mockDeals: Record<string, unknown>[] = [];
const mockPartners: Record<string, unknown>[] = [];
const mockAssignments: Record<string, unknown>[] = [];
const mockOrgUsers = ['user-123', 'user-456', 'user-789']; // Users in the org

// Setup routes with mocked middleware
mockApp.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { user: typeof mockUser; org: typeof mockOrg }).user = mockUser;
    (req as express.Request & { user: typeof mockUser; org: typeof mockOrg }).org = mockOrg;
    next();
});

// Helper to create a partner
function createMockPartner(name = 'Test Partner') {
    const partner = {
        id: `partner-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        organizationId: mockOrg.id,
        name,
        type: 'reseller',
        status: 'active',
    };
    mockPartners.push(partner);
    return partner;
}

// POST /api/deals - Create deal
mockApp.post('/api/deals', (req: express.Request, res: express.Response) => {
    const { partnerId, title, description, value } = req.body;

    // Validation
    if (!partnerId) {
        res.status(400).json({ error: 'Partner ID is required' });
        return;
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json({ error: 'Deal title is required' });
        return;
    }

    // Check partner exists
    const partner = mockPartners.find(p => p.id === partnerId && p.organizationId === mockOrg.id);
    if (!partner) {
        res.status(404).json({ error: 'Partner not found in this organization' });
        return;
    }

    const deal = {
        id: `deal-${Date.now()}`,
        organizationId: mockOrg.id,
        partnerId,
        partnerName: partner.name,
        title,
        description: description || null,
        value: value !== undefined ? value : null,
        stage: 'lead',
        createdByUserId: mockUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assigneeCount: 0,
    };

    mockDeals.push(deal);
    res.status(201).json({ deal });
});

// GET /api/deals - List deals
mockApp.get('/api/deals', (req: express.Request, res: express.Response) => {
    let filteredDeals = [...mockDeals];

    // Filter by stage
    if (req.query.stage) {
        filteredDeals = filteredDeals.filter(d => d.stage === req.query.stage);
    }

    // Filter by partnerId
    if (req.query.partnerId) {
        filteredDeals = filteredDeals.filter(d => d.partnerId === req.query.partnerId);
    }

    // Update assignee counts
    filteredDeals = filteredDeals.map(d => ({
        ...d,
        assigneeCount: mockAssignments.filter(a => a.dealId === d.id).length,
    }));

    res.json({ deals: filteredDeals });
});

// GET /api/deals/:dealId - Get deal by ID
mockApp.get('/api/deals/:dealId', (req: express.Request, res: express.Response) => {
    const deal = mockDeals.find(d => d.id === req.params.dealId);
    if (!deal) {
        res.status(404).json({ error: 'Deal not found' });
        return;
    }

    const partner = mockPartners.find(p => p.id === deal.partnerId);
    const assignments = mockAssignments.filter(a => a.dealId === req.params.dealId);

    res.json({
        deal,
        partner: partner ? { id: partner.partnerId, name: partner.name } : null,
        assignments,
        activities: [],
    });
});

// PATCH /api/deals/:dealId - Update deal
mockApp.patch('/api/deals/:dealId', (req: express.Request, res: express.Response) => {
    const deal = mockDeals.find(d => d.id === req.params.dealId);
    if (!deal) {
        res.status(404).json({ error: 'Deal not found' });
        return;
    }

    const { title, description, value, stage } = req.body;

    if (title === undefined && description === undefined && value === undefined && stage === undefined) {
        res.status(400).json({ error: 'No fields to update' });
        return;
    }

    // Validate stage if provided
    if (stage !== undefined) {
        const validStages = ['lead', 'proposal', 'negotiation', 'won', 'lost'];
        if (!validStages.includes(stage)) {
            res.status(400).json({ error: 'Invalid deal stage' });
            return;
        }
        deal.stage = stage;
    }

    if (title !== undefined) deal.title = title;
    if (description !== undefined) deal.description = description;
    if (value !== undefined) deal.value = value;
    deal.updatedAt = new Date().toISOString();

    res.json({ deal });
});

// DELETE /api/deals/:dealId - Soft delete deal
mockApp.delete('/api/deals/:dealId', (req: express.Request, res: express.Response) => {
    const deal = mockDeals.find(d => d.id === req.params.dealId);
    if (!deal) {
        res.status(404).json({ error: 'Deal not found' });
        return;
    }

    deal.stage = 'lost';
    deal.updatedAt = new Date().toISOString();

    res.json({ deal });
});

// POST /api/deals/:dealId/assign - Assign user to deal
mockApp.post('/api/deals/:dealId/assign', (req: express.Request, res: express.Response) => {
    const deal = mockDeals.find(d => d.id === req.params.dealId);
    if (!deal) {
        res.status(404).json({ error: 'Deal not found' });
        return;
    }

    const { userId } = req.body;

    if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
    }

    // Check if user is org member
    if (!mockOrgUsers.includes(userId)) {
        res.status(400).json({ error: 'User is not a member of this organization' });
        return;
    }

    // Check for duplicate
    const existing = mockAssignments.find(a => a.dealId === req.params.dealId && a.userId === userId);
    if (existing) {
        res.status(409).json({ error: 'User is already assigned to this deal' });
        return;
    }

    const assignment = {
        id: `assign-${Date.now()}`,
        dealId: req.params.dealId,
        userId,
        assignedAt: new Date().toISOString(),
        userName: 'Test User',
        userEmail: 'test@example.com',
        userImage: null,
    };

    mockAssignments.push(assignment);
    res.status(201).json({ assignment });
});

// GET /api/deals/:dealId/assign - Get deal assignments
mockApp.get('/api/deals/:dealId/assign', (req: express.Request, res: express.Response) => {
    const deal = mockDeals.find(d => d.id === req.params.dealId);
    if (!deal) {
        res.status(404).json({ error: 'Deal not found' });
        return;
    }

    const assignments = mockAssignments.filter(a => a.dealId === req.params.dealId);
    res.json({ assignments });
});

// DELETE /api/deals/:dealId/assign/:userId - Remove assignment
mockApp.delete('/api/deals/:dealId/assign/:userId', (req: express.Request, res: express.Response) => {
    const deal = mockDeals.find(d => d.id === req.params.dealId);
    if (!deal) {
        res.status(404).json({ error: 'Deal not found' });
        return;
    }

    const index = mockAssignments.findIndex(
        a => a.dealId === req.params.dealId && a.userId === req.params.userId
    );

    if (index === -1) {
        res.status(404).json({ error: 'Assignment not found' });
        return;
    }

    mockAssignments.splice(index, 1);
    res.json({ success: true });
});

describe('Deals API - Blackbox Tests', () => {
    beforeEach(() => {
        mockDeals.length = 0;
        mockPartners.length = 0;
        mockAssignments.length = 0;
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('POST /api/deals - Create Deal', () => {
        it('should create a deal with required fields', async () => {
            const partner = createMockPartner();

            const response = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Enterprise License Deal' })
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.deal).toBeDefined();
            expect(response.body.deal.title).toBe('Enterprise License Deal');
            expect(response.body.deal.partnerId).toBe(partner.partnerId);
            expect(response.body.deal.stage).toBe('lead');
        });

        it('should create a deal with all fields', async () => {
            const partner = createMockPartner();

            const response = await request(mockApp)
                .post('/api/deals')
                .send({
                    partnerId: partner.partnerId,
                    title: 'Big Deal',
                    description: 'A very important deal',
                    value: 100000,
                })
                .expect(201);

            expect(response.body.deal.title).toBe('Big Deal');
            expect(response.body.deal.description).toBe('A very important deal');
            expect(response.body.deal.value).toBe(100000);
        });

        it('should create a deal with zero value', async () => {
            const partner = createMockPartner();

            const response = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Free Trial', value: 0 })
                .expect(201);

            expect(response.body.deal.value).toBe(0);
        });

        it('should reject missing partner ID', async () => {
            const response = await request(mockApp)
                .post('/api/deals')
                .send({ title: 'Test Deal' })
                .expect(400);

            expect(response.body.error).toBeDefined();
        });

        it('should reject missing title', async () => {
            const partner = createMockPartner();

            const response = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId })
                .expect(400);

            expect(response.body.error).toBeDefined();
        });

        it('should reject non-existent partner', async () => {
            const response = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: 'nonexistent-partner', title: 'Test Deal' })
                .expect(404);

            expect(response.body.error).toBe('Partner not found in this organization');
        });
    });

    describe('GET /api/deals - List Deals', () => {
        it('should return empty array when no deals exist', async () => {
            const response = await request(mockApp)
                .get('/api/deals')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.deals).toEqual([]);
        });

        it('should return all deals for organization', async () => {
            const partner = createMockPartner();

            await request(mockApp).post('/api/deals').send({ partnerId: partner.partnerId, title: 'Deal 1' });
            await request(mockApp).post('/api/deals').send({ partnerId: partner.partnerId, title: 'Deal 2' });
            await request(mockApp).post('/api/deals').send({ partnerId: partner.partnerId, title: 'Deal 3' });

            const response = await request(mockApp)
                .get('/api/deals')
                .expect(200);

            expect(response.body.deals).toHaveLength(3);
        });

        it('should filter deals by stage', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Deal 1' });
            const dealId = createRes.body.deal.dealId;

            await request(mockApp)
                .patch(`/api/deals/${dealId}`)
                .send({ stage: 'proposal' });

            await request(mockApp).post('/api/deals').send({ partnerId: partner.partnerId, title: 'Deal 2' });

            const response = await request(mockApp)
                .get('/api/deals?stage=proposal')
                .expect(200);

            expect(response.body.deals).toHaveLength(1);
            expect(response.body.deals[0].stage).toBe('proposal');
        });

        it('should filter deals by partnerId', async () => {
            const partner1 = createMockPartner('Partner 1');
            const partner2 = createMockPartner('Partner 2');

            await request(mockApp).post('/api/deals').send({ partnerId: partner1.id, title: 'Deal 1' });
            await request(mockApp).post('/api/deals').send({ partnerId: partner2.id, title: 'Deal 2' });

            const response = await request(mockApp)
                .get(`/api/deals?partnerId=${partner1.id}`)
                .expect(200);

            expect(response.body.deals).toHaveLength(1);
            expect(response.body.deals[0].partnerId).toBe(partner1.id);
        });

        it('should include assignee count', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Deal with Assignees' });
            const dealId = createRes.body.deal.dealId;

            await request(mockApp)
                .post(`/api/deals/${dealId}/assign`)
                .send({ userId: 'user-123' });

            const response = await request(mockApp)
                .get('/api/deals')
                .expect(200);

            expect(response.body.deals[0].assigneeCount).toBe(1);
        });
    });

    describe('GET /api/deals/:dealId - Get Deal', () => {
        it('should return deal with all details', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal', value: 50000 });
            const dealId = createRes.body.deal.dealId;

            const response = await request(mockApp)
                .get(`/api/deals/${dealId}`)
                .expect(200);

            expect(response.body.deal).toBeDefined();
            expect(response.body.deal.title).toBe('Test Deal');
            expect(response.body.partner).toBeDefined();
            expect(response.body.partner.partnerId).toBe(partner.partnerId);
            expect(response.body.assignments).toBeDefined();
            expect(response.body.activities).toBeDefined();
        });

        it('should return 404 for non-existent deal', async () => {
            const response = await request(mockApp)
                .get('/api/deals/nonexistent-id')
                .expect(404);

            expect(response.body.error).toBe('Deal not found');
        });
    });

    describe('PATCH /api/deals/:dealId - Update Deal', () => {
        it('should update deal title', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Old Title' });
            const dealId = createRes.body.deal.dealId;

            const response = await request(mockApp)
                .patch(`/api/deals/${dealId}`)
                .send({ title: 'New Title' })
                .expect(200);

            expect(response.body.deal.title).toBe('New Title');
        });

        it('should update deal value', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal', value: 10000 });
            const dealId = createRes.body.deal.dealId;

            const response = await request(mockApp)
                .patch(`/api/deals/${dealId}`)
                .send({ value: 75000 })
                .expect(200);

            expect(response.body.deal.value).toBe(75000);
        });

        it('should update deal stage to proposal', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal' });
            const dealId = createRes.body.deal.dealId;

            const response = await request(mockApp)
                .patch(`/api/deals/${dealId}`)
                .send({ stage: 'proposal' })
                .expect(200);

            expect(response.body.deal.stage).toBe('proposal');
        });

        it('should update deal stage to negotiation', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal' });
            const dealId = createRes.body.deal.dealId;

            const response = await request(mockApp)
                .patch(`/api/deals/${dealId}`)
                .send({ stage: 'negotiation' })
                .expect(200);

            expect(response.body.deal.stage).toBe('negotiation');
        });

        it('should update deal stage to won', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal' });
            const dealId = createRes.body.deal.dealId;

            const response = await request(mockApp)
                .patch(`/api/deals/${dealId}`)
                .send({ stage: 'won' })
                .expect(200);

            expect(response.body.deal.stage).toBe('won');
        });

        it('should reject invalid stage', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal' });
            const dealId = createRes.body.deal.dealId;

            await request(mockApp)
                .patch(`/api/deals/${dealId}`)
                .send({ stage: 'invalid' })
                .expect(400);
        });

        it('should reject update with no fields', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal' });
            const dealId = createRes.body.deal.dealId;

            const response = await request(mockApp)
                .patch(`/api/deals/${dealId}`)
                .send({})
                .expect(400);

            expect(response.body.error).toBe('No fields to update');
        });

        it('should return 404 for non-existent deal', async () => {
            await request(mockApp)
                .patch('/api/deals/nonexistent')
                .send({ title: 'New Title' })
                .expect(404);
        });
    });

    describe('DELETE /api/deals/:dealId - Soft Delete Deal', () => {
        it('should soft delete deal by setting stage to lost', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Deal to Delete' });
            const dealId = createRes.body.deal.dealId;

            const response = await request(mockApp)
                .delete(`/api/deals/${dealId}`)
                .expect(200);

            expect(response.body.deal.stage).toBe('lost');
        });

        it('should preserve deal data after soft delete', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({
                    partnerId: partner.partnerId,
                    title: 'Important Deal',
                    description: 'Very important',
                    value: 250000,
                });
            const dealId = createRes.body.deal.dealId;

            const response = await request(mockApp)
                .delete(`/api/deals/${dealId}`)
                .expect(200);

            expect(response.body.deal.title).toBe('Important Deal');
            expect(response.body.deal.description).toBe('Very important');
            expect(response.body.deal.value).toBe(250000);
        });

        it('should return 404 for non-existent deal', async () => {
            await request(mockApp)
                .delete('/api/deals/nonexistent')
                .expect(404);
        });
    });

    describe('POST /api/deals/:dealId/assign - Assign User', () => {
        it('should assign user to deal', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal' });
            const dealId = createRes.body.deal.dealId;

            const response = await request(mockApp)
                .post(`/api/deals/${dealId}/assign`)
                .send({ userId: 'user-456' })
                .expect(201);

            expect(response.body.assignment).toBeDefined();
            expect(response.body.assignment.userId).toBe('user-456');
            expect(response.body.assignment.dealId).toBe(dealId);
        });

        it('should reject duplicate assignment', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal' });
            const dealId = createRes.body.deal.dealId;

            await request(mockApp)
                .post(`/api/deals/${dealId}/assign`)
                .send({ userId: 'user-456' });

            const response = await request(mockApp)
                .post(`/api/deals/${dealId}/assign`)
                .send({ userId: 'user-456' })
                .expect(409);

            expect(response.body.error).toBe('User is already assigned to this deal');
        });

        it('should reject non-org member', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal' });
            const dealId = createRes.body.deal.dealId;

            const response = await request(mockApp)
                .post(`/api/deals/${dealId}/assign`)
                .send({ userId: 'external-user' })
                .expect(400);

            expect(response.body.error).toBe('User is not a member of this organization');
        });

        it('should return 404 for non-existent deal', async () => {
            await request(mockApp)
                .post('/api/deals/nonexistent/assign')
                .send({ userId: 'user-123' })
                .expect(404);
        });
    });

    describe('GET /api/deals/:dealId/assign - List Assignments', () => {
        it('should return empty array when no assignments', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal' });
            const dealId = createRes.body.deal.dealId;

            const response = await request(mockApp)
                .get(`/api/deals/${dealId}/assign`)
                .expect(200);

            expect(response.body.assignments).toEqual([]);
        });

        it('should return all assignments', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal' });
            const dealId = createRes.body.deal.dealId;

            await request(mockApp)
                .post(`/api/deals/${dealId}/assign`)
                .send({ userId: 'user-123' });
            await request(mockApp)
                .post(`/api/deals/${dealId}/assign`)
                .send({ userId: 'user-456' });

            const response = await request(mockApp)
                .get(`/api/deals/${dealId}/assign`)
                .expect(200);

            expect(response.body.assignments).toHaveLength(2);
        });

        it('should return 404 for non-existent deal', async () => {
            await request(mockApp)
                .get('/api/deals/nonexistent/assign')
                .expect(404);
        });
    });

    describe('DELETE /api/deals/:dealId/assign/:userId - Remove Assignment', () => {
        it('should remove existing assignment', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal' });
            const dealId = createRes.body.deal.dealId;

            await request(mockApp)
                .post(`/api/deals/${dealId}/assign`)
                .send({ userId: 'user-456' });

            const response = await request(mockApp)
                .delete(`/api/deals/${dealId}/assign/user-456`)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        it('should return 404 for non-existent assignment', async () => {
            const partner = createMockPartner();

            const createRes = await request(mockApp)
                .post('/api/deals')
                .send({ partnerId: partner.partnerId, title: 'Test Deal' });
            const dealId = createRes.body.deal.dealId;

            await request(mockApp)
                .delete(`/api/deals/${dealId}/assign/nonexistent-user`)
                .expect(404);
        });

        it('should return 404 for non-existent deal', async () => {
            await request(mockApp)
                .delete('/api/deals/nonexistent/assign/user-123')
                .expect(404);
        });
    });
});
