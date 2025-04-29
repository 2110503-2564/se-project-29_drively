const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const Car = require('../models/car');

describe('Car Details API Tests', () => {
    let testCar;

    beforeAll(async () => {
        // Create a test car in the database
        testCar = await Car.create({
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            numberPlates: 'TEST123',
            description: 'Test car description',
            rentalPrice: 500,
            color: 'Black',
            transmission: 'automatic',
            fuelType: 'petrol',
            features: ['GPS', 'Bluetooth'],
            available: true,
            createdBy: new mongoose.Types.ObjectId(), // Mock user ID
        });
    });

    afterAll(async () => {
        // Cleanup test data
        await Car.findByIdAndDelete(testCar._id);
        await mongoose.connection.close();
    });

    describe('GET /api/v1/cars/:id', () => {
        it('should successfully get car details by ID', async () => {
            const response = await request(server)
                .get(`/api/v1/cars/${testCar._id}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toMatchObject({
                make: 'Toyota',
                model: 'Camry',
                year: 2023,
                numberPlates: 'TEST123',
                rentalPrice: 500,
                color: 'Black',
                transmission: 'automatic',
                fuelType: 'petrol'
            });
        });

        it('should return 404 for non-existent car ID', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(server)
                .get(`/api/v1/cars/${nonExistentId}`)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Car not found');
        });

        it('should return 500 for invalid car ID format', async () => {
            const response = await request(server)
                .get('/api/v1/cars/invalid-id')
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Server Error');
        });
    });
});
