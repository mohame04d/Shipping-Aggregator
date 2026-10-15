import { z} from 'zod';

const signUpSchema = z.object({
    body: z.object({
        name: z.string()
            .trim()
            .min(3, 'name must be at least 3 characters'),

        email: z.string()
            .trim()
            .email('invalid email'),

        password: z.string()
            .trim()
            .min(8, 'password must be at least 8 characters'),

        phone: z.string()
            .trim()
            .optional()
    }),

    params: z.object({}),
    query: z.object({})
});

const loginSchema = z.object({
    body: z.object({
        email: z.string()
            .trim()
            .email('invalid email'),

        password: z.string()
            .trim()
            .min(8, 'password must be at least 8 characters')
    }),

    params: z.object({}),
    query: z.object({})
});

export {signUpSchema, loginSchema};