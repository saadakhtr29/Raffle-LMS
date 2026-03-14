const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    const issues = error.errors || error.issues || [];
    return res.status(400).json({
      error: 'Validation failed',
      details: issues.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
    });
  }
};

const schemas = {
  auth: {
    login: z.object({
      body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }),
    }),
  },
  prize: {
    create: z.object({
      body: z.object({
        name: z.string().min(3).max(100),
      }),
    }),
    update: z.object({
      params: z.object({
        id: z.string().regex(/^\d+$/),
      }),
      body: z.object({
        name: z.string().min(3).max(100).optional(),
        status: z.enum(['AVAILABLE', 'INACTIVE']).optional(),
      }),
    }),
  },
  draw: {
    start: z.object({
      body: z.object({
        prizeId: z.union([z.number().int().positive(), z.null()]).optional(),
      }),
    }),
    remove: z.object({
      body: z.object({
        ticketId: z.number().int().positive(),
      }),
    }),
  },
};

module.exports = { validate, schemas };
