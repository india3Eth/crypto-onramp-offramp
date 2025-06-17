import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/utils/auth/auth';
import { UserModel } from '@/models/user';
import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { logger } from '@/services/logger-service';

export async function GET(request: NextRequest) {
  try {
    // Get current authenticated user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.email) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Get full user data including customerId
    const user = await UserModel.getUserByEmail(currentUser.email);
    
    if (!user || !user.customerId) {
      return new Response('Customer ID not found', { status: 404 });
    }
    
    // Create SSE response
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection established event
        const data = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
        
        // Set up polling interval to check for new events
        const interval = setInterval(async () => {
          try {
            await checkForNewEvents(user.customerId!, controller);
          } catch (error) {
            logger.error('Error checking for SSE events', error);
          }
        }, 1000); // Check every second
        
        // Cleanup function
        const cleanup = () => {
          clearInterval(interval);
          controller.close();
        };
        
        // Handle client disconnect
        request.signal.addEventListener('abort', cleanup);
        
        // Auto-cleanup after 5 minutes to prevent memory leaks
        setTimeout(cleanup, 5 * 60 * 1000);
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });
    
  } catch (error) {
    logger.error('Error setting up SSE connection', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * Check for new SSE events for the user and send them
 */
async function checkForNewEvents(customerId: string, controller: ReadableStreamDefaultController) {
  try {
    const db = await getDb();
    const usersCollection = db.collection(COLLECTIONS.USERS);
    
    // Get user with pending SSE events
    const user = await usersCollection.findOne({ 
      customerId,
      sseEvents: { $exists: true, $ne: [] }
    });
    
    if (user && user.sseEvents && user.sseEvents.length > 0) {
      // Send all pending events
      for (const event of user.sseEvents) {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      }
      
      // Clear the events after sending
      await usersCollection.updateOne(
        { customerId },
        { $unset: { sseEvents: "" } }
      );
      
      logger.info('SSE events sent and cleared', { 
        customerId, 
        eventCount: user.sseEvents.length 
      });
    }
    
  } catch (error) {
    logger.error('Error checking for new SSE events', error);
  }
}