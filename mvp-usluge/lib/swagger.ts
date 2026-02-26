import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

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
                Worker: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        email: { type: 'string', format: 'email', nullable: true },
                        phone: { type: 'string', nullable: true },
                        position: { type: 'string' },
                        specializations: { type: 'array', items: { type: 'string' } },
                        profileImage: { type: 'string', nullable: true },
                        isActive: { type: 'boolean' },
                        companyId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                WorkingHours: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        dayOfWeek: { type: 'integer', minimum: 0, maximum: 6 },
                        startTime: { type: 'string', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
                        endTime: { type: 'string', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$' },
                        isActive: { type: 'boolean' },
                        userId: { type: 'string', format: 'uuid' },
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
            { name: 'Workers', description: 'Upravljanje radnicima (samo COMPANY)' },
            { name: 'Profile', description: 'Profil i podaci korisnika' },
            { name: 'Calendar', description: 'Upravljanje radnim vremenom i dostupnostima' },
            { name: 'Admin', description: 'Administratorske opcije' },
            { name: 'Geolocation', description: 'Geolocation servisi' },
            { name: 'Cron', description: 'Cron job endpoint-i' },
            { name: 'Documentation', description: 'API dokumentacija' },
            { name: 'Health', description: 'Health check endpoint' },
            { name: 'Analytics', description: 'Analitika i statistika' },
        ],
    },
};

function getApiFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getApiFiles(filePath, fileList);
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            fileList.push(filePath.replace(/\\/g, '/'));
        }
    }
    return fileList;
}

export const getSwaggerSpec = () => {
    let apiFiles: string[] = [];
    try {
        const apiDir = path.join(process.cwd(), 'app', 'api');
        apiFiles = getApiFiles(apiDir);
        console.log("Swagger extracted file count: " + apiFiles.length);
        if (apiFiles.length > 0) {
            console.log("Example file: " + apiFiles[0]);
        }
    } catch (error) {
        console.error('Error reading API directories for Swagger:', error);
    }

    return swaggerJsdoc({
        ...options,
        apis: apiFiles,
    });
};

export const swaggerSpec = getSwaggerSpec();
