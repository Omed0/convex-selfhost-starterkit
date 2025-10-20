import './helpers/polyfills';
import { httpRouter } from 'convex/server';
import { registerRoutes } from 'better-auth-convex';
import { createAuth } from './auth';

const http = httpRouter();

registerRoutes(http, createAuth);

export default http;
