import { z } from 'zod';
import {baseProcedure, createTRPCRouter, protectedProcedure} from '../init';
export const appRouter = createTRPCRouter({
    hello: protectedProcedure
        .query((opts) => {
            const userName = opts.ctx.user.name;

            return {
                greeting: `hello ${userName}`,
            };
        }),
});
// export type definition of API
export type AppRouter = typeof appRouter;