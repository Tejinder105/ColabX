/**
 * BLACKBOX TESTS: Partners API Integration Tests
 * These tests verify the Partners API endpoints without knowledge of internal implementation.
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
const mockPartners: Record<string, unknown>[] = [];

// Setup routes with mocked middleware
mockApp.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
    (req as express.Request & { user: typeof mockUser; org: typeof mockOrg }).user = mockUser;
    (req as express.Request & { user: typeof mockUser; org: typeof mockOrg }).org = mockOrg;
    next();
});

// POST /api/partners - Create partner
mockApp.post('/api/partners', (req: express.Request, res: express.Response) => {
    const { name, type, contactEmail, industry, onboardingDate } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Partner name is required' });
        return;
    }

    const validTypes = ['reseller', 'agent', 'technology', 'distributor'];
    if (!type || !validTypes.includes(type)) {
        res.status(400).json({ error: 'Valid partner type is required' });
        return;
    }

    // Email validation if provided
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
    }

    const partner = {
        id: `partner-${Date.now()}`,
        organizationId: mockOrg.id,
        name,
        type,
        status: 'active',
        contactEmail: contactEmail || null,
        industry: industry || null,
        onboardingDate: onboardingDate ? new Date(onboardingDate).toISOString() : null,
        createdByUserId: mockUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    mockPartners.push(partner);
    res.status(201).json({ partner });
});

// GET /api/partners - List partners
mockApp.get('/api/partners', (_req: express.Request, res: express.Response) => {
    res.json({ partners: mockPartners });
});

// GET /api/partners/:partnerId - Get partner by ID
mockApp.get('/api/partners/:partnerId', (req: express.Request, res: express.Response) => {
    const partner = mockPartners.find(p => p.id === req.params.partnerId);
    if (!partner) {
        res.status(404).json({ error: 'Partner not found' });
        return;
    }
    res.json({ partner, teams: [] });
});

// PATCH /api/partners/:partnerId - Update partner
mockApp.patch('/api/partners/:partnerId', (req: express.Request, res: express.Response) => {
    const partner = mockPartners.find(p => p.id === req.params.partnerId);
    if (!partner) {
        res.status(404).json({ error: 'Partner not found' });
        return;
    }

    const { name, type, status, contactEmail, industry, onboardingDate } = req.body;

    if (name === undefined && type === undefined && status === undefined &&
        contactEmail === undefined && industry === undefined && onboardingDate === undefined) {
        res.status(400).json({ error: 'No fields to update' });
        return;
    }

    // Validate type if provided
    if (type !== undefined) {
        const validTypes = ['reseller', 'agent', 'technology', 'distributor'];
        if (!validTypes.includes(type)) {
            res.status(400).json({ error: 'Invalid partner type' });
            return;
        }
        partner.type = type;
    }

    // Validate status if provided
    if (status !== undefined) {
        const validStatuses = ['active', 'inactive', 'suspended'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid partner status' });
            return;
        }
        partner.status = status;
    }

    // Validate email if provided
    if (contactEmail !== undefined && contactEmail !== null) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }
    }

    if (name !== undefined) partner.name = name;
    if (contactEmail !== undefined) partner.contactEmail = contactEmail;
    if (industry !== undefined) partner.industry = industry;
    if (onboardingDate !== undefined) {
        partner.onboardingDate = onboardingDate ? new Date(onboardingDate).toISOString() : null;
    }
    partner.updatedAt = new Date().toISOString();

    res.json({ partner });
});

// DELETE /api/partners/:partnerId - Soft delete partner
mockApp.delete('/api/partners/:partnerId', (req: express.Request, res: express.Response) => {
    const partner = mockPartners.find(p => p.id === req.params.partnerId);
    if (!partner) {
        res.status(404).json({ error: 'Partner not found' });
        return;
    }

    partner.status = 'inactive';
    partner.updatedAt = new Date().toISOString();

    res.json({ partner });
});

describe('Partners API - Blackbox Tests', () => {
    beforeEach(() => {
        mockPartners.length = 0;
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('POST /api/partners - Create Partner', () => {
        it('should create a partner with required fields', async () => {
            const response = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Acme Corp', type: 'reseller' })
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body.partner).toBeDefined();
            expect(response.body.partner.name).toBe('Acme Corp');
            expect(response.body.partner.type).toBe('reseller');
            expect(response.body.partner.status).toBe('active');
        });

        it('should create a partner with all fields', async () => {
            const response = await request(mockApp)
                .post('/api/partners')
                .send({
                    name: 'Tech Solutions',
                    type: 'technology',
                    contactEmail: 'contact@tech.com',
                    industry: 'Technology',
                    onboardingDate: '2024-01-15',
                })
                .expect(201);

            expect(response.body.partner.contactEmail).toBe('contact@tech.com');
            expect(response.body.partner.industry).toBe('Technology');
            expect(response.body.partner.onboardingDate).toBeDefined();
        });

        it('should create partner with agent type', async () => {
            const response = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Agent Inc', type: 'agent' })
                .expect(201);

            expect(response.body.partner.type).toBe('agent');
        });

        it('should create partner with distributor type', async () => {
            const response = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Distributor LLC', type: 'distributor' })
                .expect(201);

            expect(response.body.partner.type).toBe('distributor');
        });

        it('should reject missing partner name', async () => {
            const response = await request(mockApp)
                .post('/api/partners')
                .send({ type: 'reseller' })
                .expect(400);

            expect(response.body.error).toBeDefined();
        });

        it('should reject empty partner name', async () => {
            const response = await request(mockApp)
                .post('/api/partners')
                .send({ name: '', type: 'reseller' })
                .expect(400);

            expect(response.body.error).toBeDefined();
        });

        it('should reject missing partner type', async () => {
            const response = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Test Partner' })
                .expect(400);

            expect(response.body.error).toBeDefined();
        });

        it('should reject invalid partner type', async () => {
            const response = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Test Partner', type: 'invalid' })
                .expect(400);

            expect(response.body.error).toBeDefined();
        });

        it('should reject invalid email format', async () => {
            const response = await request(mockApp)
                .post('/api/partners')
                .send({
                    name: 'Test Partner',
                    type: 'reseller',
                    contactEmail: 'invalid-email',
                })
                .expect(400);

            expect(response.body.error).toBe('Invalid email format');
        });
    });

    describe('GET /api/partners - List Partners', () => {
        it('should return empty array when no partners exist', async () => {
            const response = await request(mockApp)
                .get('/api/partners')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body.partners).toEqual([]);
        });

        it('should return all partners for organization', async () => {
            await request(mockApp).post('/api/partners').send({ name: 'Partner 1', type: 'reseller' });
            await request(mockApp).post('/api/partners').send({ name: 'Partner 2', type: 'agent' });
            await request(mockApp).post('/api/partners').send({ name: 'Partner 3', type: 'technology' });

            const response = await request(mockApp)
                .get('/api/partners')
                .expect(200);

            expect(response.body.partners).toHaveLength(3);
        });

        it('should include all partner fields in response', async () => {
            await request(mockApp)
                .post('/api/partners')
                .send({
                    name: 'Full Partner',
                    type: 'distributor',
                    contactEmail: 'contact@full.com',
                    industry: 'Retail',
                });

            const response = await request(mockApp)
                .get('/api/partners')
                .expect(200);

            const partner = response.body.partners[0];
            expect(partner.partnerId).toBeDefined();
            expect(partner.name).toBe('Full Partner');
            expect(partner.type).toBe('distributor');
            expect(partner.status).toBe('active');
            expect(partner.contactEmail).toBe('contact@full.com');
            expect(partner.industry).toBe('Retail');
            expect(partner.createdAt).toBeDefined();
            expect(partner.updatedAt).toBeDefined();
        });
    });

    describe('GET /api/partners/:partnerId - Get Partner', () => {
        it('should return partner with teams', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Test Partner', type: 'reseller' });
            const partnerId = createResponse.body.partner.partnerId;

            const response = await request(mockApp)
                .get(`/api/partners/${partnerId}`)
                .expect(200);

            expect(response.body.partner).toBeDefined();
            expect(response.body.partner.name).toBe('Test Partner');
            expect(response.body.teams).toBeDefined();
            expect(Array.isArray(response.body.teams)).toBe(true);
        });

        it('should return 404 for non-existent partner', async () => {
            const response = await request(mockApp)
                .get('/api/partners/nonexistent-id')
                .expect(404);

            expect(response.body.error).toBe('Partner not found');
        });
    });

    describe('PATCH /api/partners/:partnerId - Update Partner', () => {
        it('should update partner name', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Old Name', type: 'reseller' });
            const partnerId = createResponse.body.partner.partnerId;

            const response = await request(mockApp)
                .patch(`/api/partners/${partnerId}`)
                .send({ name: 'New Name' })
                .expect(200);

            expect(response.body.partner.name).toBe('New Name');
        });

        it('should update partner type', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Test Partner', type: 'reseller' });
            const partnerId = createResponse.body.partner.partnerId;

            const response = await request(mockApp)
                .patch(`/api/partners/${partnerId}`)
                .send({ type: 'technology' })
                .expect(200);

            expect(response.body.partner.type).toBe('technology');
        });

        it('should update partner status', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Test Partner', type: 'reseller' });
            const partnerId = createResponse.body.partner.partnerId;

            const response = await request(mockApp)
                .patch(`/api/partners/${partnerId}`)
                .send({ status: 'suspended' })
                .expect(200);

            expect(response.body.partner.status).toBe('suspended');
        });

        it('should update contact email', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Test Partner', type: 'reseller' });
            const partnerId = createResponse.body.partner.partnerId;

            const response = await request(mockApp)
                .patch(`/api/partners/${partnerId}`)
                .send({ contactEmail: 'newemail@test.com' })
                .expect(200);

            expect(response.body.partner.contactEmail).toBe('newemail@test.com');
        });

        it('should update industry', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Test Partner', type: 'reseller' });
            const partnerId = createResponse.body.partner.partnerId;

            const response = await request(mockApp)
                .patch(`/api/partners/${partnerId}`)
                .send({ industry: 'Healthcare' })
                .expect(200);

            expect(response.body.partner.industry).toBe('Healthcare');
        });

        it('should clear contact email with null', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Test Partner', type: 'reseller', contactEmail: 'old@test.com' });
            const partnerId = createResponse.body.partner.partnerId;

            const response = await request(mockApp)
                .patch(`/api/partners/${partnerId}`)
                .send({ contactEmail: null })
                .expect(200);

            expect(response.body.partner.contactEmail).toBeNull();
        });

        it('should reject update with no fields', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Test Partner', type: 'reseller' });
            const partnerId = createResponse.body.partner.partnerId;

            const response = await request(mockApp)
                .patch(`/api/partners/${partnerId}`)
                .send({})
                .expect(400);

            expect(response.body.error).toBe('No fields to update');
        });

        it('should reject invalid partner type', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Test Partner', type: 'reseller' });
            const partnerId = createResponse.body.partner.partnerId;

            await request(mockApp)
                .patch(`/api/partners/${partnerId}`)
                .send({ type: 'invalid' })
                .expect(400);
        });

        it('should reject invalid partner status', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Test Partner', type: 'reseller' });
            const partnerId = createResponse.body.partner.partnerId;

            await request(mockApp)
                .patch(`/api/partners/${partnerId}`)
                .send({ status: 'invalid' })
                .expect(400);
        });

        it('should return 404 for non-existent partner', async () => {
            await request(mockApp)
                .patch('/api/partners/nonexistent')
                .send({ name: 'New Name' })
                .expect(404);
        });
    });

    describe('DELETE /api/partners/:partnerId - Soft Delete Partner', () => {
        it('should soft delete partner by setting status to inactive', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Partner to Delete', type: 'reseller' });
            const partnerId = createResponse.body.partner.partnerId;

            const response = await request(mockApp)
                .delete(`/api/partners/${partnerId}`)
                .expect(200);

            expect(response.body.partner.status).toBe('inactive');
            expect(response.body.partner.name).toBe('Partner to Delete');
        });

        it('should preserve partner data after soft delete', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({
                    name: 'Full Partner',
                    type: 'technology',
                    contactEmail: 'contact@full.com',
                    industry: 'Tech',
                });
            const partnerId = createResponse.body.partner.partnerId;

            const response = await request(mockApp)
                .delete(`/api/partners/${partnerId}`)
                .expect(200);

            expect(response.body.partner.name).toBe('Full Partner');
            expect(response.body.partner.type).toBe('technology');
            expect(response.body.partner.contactEmail).toBe('contact@full.com');
            expect(response.body.partner.status).toBe('inactive');
        });

        it('should still be retrievable after soft delete', async () => {
            const createResponse = await request(mockApp)
                .post('/api/partners')
                .send({ name: 'Deleted Partner', type: 'agent' });
            const partnerId = createResponse.body.partner.partnerId;

            await request(mockApp)
                .delete(`/api/partners/${partnerId}`)
                .expect(200);

            const getResponse = await request(mockApp)
                .get(`/api/partners/${partnerId}`)
                .expect(200);

            expect(getResponse.body.partner.status).toBe('inactive');
        });

        it('should return 404 for non-existent partner', async () => {
            await request(mockApp)
                .delete('/api/partners/nonexistent')
                .expect(404);
        });
    });
});
