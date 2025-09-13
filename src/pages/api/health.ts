import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Health check endpoint
 * 
 * This endpoint returns basic health information about the application
 * and can be used by monitoring services to check if the application is running.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Basic health information
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  };

  // Return health information
  res.status(200).json(healthInfo);
}
