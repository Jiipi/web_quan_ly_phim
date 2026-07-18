import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** Server MSW dùng chung cho môi trường test Node (vitest). */
export const server = setupServer(...handlers);
