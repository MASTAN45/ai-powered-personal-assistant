/**
 * Vercel API Route Entry Point
 * 
 * This file serves as the Vercel serverless function entry point.
 * It re-exports the Express app from the compiled dist directory.
 */

module.exports = require('../dist/vercel-serverless').default;