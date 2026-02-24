import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'MVP Usluge API',
            version: '1.0.0',
            description: 'REST API dokumentacija za platformu oglašavanja uslužnih aktivnosti',
            contact: {
                name: 'API Support',
                email: 'support@mvp-usluge.com',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
            {
                url: 'https://mvp-usluge.vercel.app',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'NextAuth.js JWT token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        role: {
                            type: 'string',
                            enum: ['CLIENT', 'FREELANCER', 'COMPANY', 'ADMIN']
                        },
                        isVerified: { type: 'boolean' },
                        averageRating: { type: 'number', nullable: true },
                        totalReviews: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Service: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        price: { type: 'number' },
                        pricingType: { type: 'string', enum: ['FIXED', 'HOURLY'] },
                        duration: { type: 'integer', description: 'Trajanje u minutima' },
                        locationType: {
                            type: 'string',
                            enum: ['ONSITE', 'CLIENT_LOCATION', 'ONLINE']
                        },
                        isActive: { type: 'boolean' },
                        categoryId: { type: 'string', format: 'uuid' },
                        providerId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Booking: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        scheduledDate: { type: 'string', format: 'date' },
                        scheduledTime: { type: 'string', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
                        status: {
                            type: 'string',
                            enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED']
                        },
                        clientNotes: { type: 'string', nullable: true },
                        providerNotes: { type: 'string', nullable: true },
                        clientId: { type: 'string', format: 'uuid' },
                        providerId: { type: 'string', format: 'uuid' },
                        serviceId: { type: 'string', format: 'uuid' },
                        workerId: { type: 'string', format: 'uuid', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Review: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        rating: { type: 'integer', minimum: 1, maximum: 5 },
                        comment: { type: 'string', nullable: true },
                        response: { type: 'string', nullable: true },
                        authorId: { type: 'string', format: 'uuid' },
                        targetId: { type: 'string', format: 'uuid' },
                        bookingId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        iconUrl: { type: 'string', nullable: true },
                        parentId: { type: 'string', format: 'uuid', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string' },
                        errors: {
                            type: 'object',
                            additionalProperties: {
                                type: 'array',
                                items: { type: 'string' }
                            }
                        },
                    },
                },
            },
        },
        tags: [
            { name: 'Auth', description: 'Autentifikacija i registracija' },
            { name: 'Services', description: 'Upravljanje uslugama' },
            { name: 'Bookings', description: 'Rezervacije' },
            { name: 'Reviews', description: 'Ocene i komentari' },
            { name: 'Categories', description: 'Kategorije usluga' },
            { name: 'Health', description: 'Health check endpoint' },
        ],
    },
    apis: ['./app/api/**/*.ts'], // Putanja do API ruta sa JSDoc komentarima
};

export const swaggerSpec = swaggerJsdoc(options);
