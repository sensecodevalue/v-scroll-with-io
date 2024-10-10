import kyClient from "ky";
import kyServer from "ky-universal";

import { isServer } from "@tanstack/react-query";

export const ky = isServer ? kyClient : kyServer;
