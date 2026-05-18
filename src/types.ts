import { DarflenClient } from "darflen.ts";
import { Hono } from "hono";

export type Create = (hono: Hono, darflen: DarflenClient) => void;