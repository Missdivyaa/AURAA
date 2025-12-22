import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/backend';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleClerkWebhook = async (req: any, res: any) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!WEBHOOK_SECRET) {
      throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
    }

    // Get the headers
    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Missing svix headers' });
    }

    // Get the body
    const body = JSON.stringify(req.body);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ error: 'Error verifying webhook' });
    }

    // Handle the webhook
    const eventType = evt.type;
    
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      case 'session.created':
        await handleSessionCreated(evt.data);
        break;
      case 'session.ended':
        await handleSessionEnded(evt.data);
        break;
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle user creation
async function handleUserCreated(userData: any) {
  try {
    console.log('Creating user:', userData.id);
    
    const user = await prisma.user.create({
      data: {
        clerkId: userData.id,
        email: userData.email_addresses[0]?.email_address || '',
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        phone: userData.phone_numbers[0]?.phone_number || null,
        profileImage: userData.image_url || null,
      }
    });

    console.log('User created successfully:', user.id);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

// Handle user updates
async function handleUserUpdated(userData: any) {
  try {
    console.log('Updating user:', userData.id);
    
    const user = await prisma.user.update({
      where: { clerkId: userData.id },
      data: {
        email: userData.email_addresses[0]?.email_address || '',
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        phone: userData.phone_numbers[0]?.phone_number || null,
        profileImage: userData.image_url || null,
      }
    });

    console.log('User updated successfully:', user.id);
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

// Handle user deletion
async function handleUserDeleted(userData: any) {
  try {
    console.log('Deleting user:', userData.id);
    
    // Prisma will handle cascade deletion of related records
    await prisma.user.delete({
      where: { clerkId: userData.id }
    });

    console.log('User deleted successfully:', userData.id);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

// Handle session creation
async function handleSessionCreated(sessionData: any) {
  try {
    console.log('Session created:', sessionData.id);
    // You can add session tracking logic here if needed
  } catch (error) {
    console.error('Error handling session creation:', error);
  }
}

// Handle session ended
async function handleSessionEnded(sessionData: any) {
  try {
    console.log('Session ended:', sessionData.id);
    // You can add session cleanup logic here if needed
  } catch (error) {
    console.error('Error handling session end:', error);
  }
}



