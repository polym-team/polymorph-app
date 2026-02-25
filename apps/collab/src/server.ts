import 'dotenv/config';
import { Server } from '@hocuspocus/server';
import { Database } from '@hocuspocus/extension-database';
import { jwtVerify } from 'jose';
import { prisma } from './lib/prisma.js';

const secret = new TextEncoder().encode(process.env.COLLAB_SECRET);

const server = Server.configure({
  port: Number(process.env.PORT ?? 3005),

  async onConnect({ documentName }) {
    console.log(`[connect] ${documentName}`);
  },

  async onAuthenticate({ token, documentName, connection }) {
    console.log(`[auth] ${documentName} token=${token ? 'present' : 'missing'}`);

    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const { payload } = await jwtVerify(token, secret);

      if (!payload.sub || !payload.room) {
        throw new Error('Invalid token payload');
      }

      if (payload.room !== documentName) {
        throw new Error('Token room does not match document');
      }

      if (payload.readOnly) {
        connection.readOnly = true;
      }

      console.log(`[auth] OK user=${payload.sub} room=${payload.room}`);

      return {
        user: {
          id: payload.sub,
          name: payload.name as string,
        },
      };
    } catch (err) {
      console.error(`[auth] FAILED:`, err);
      throw err;
    }
  },

  async onDisconnect({ documentName }) {
    console.log(`[disconnect] ${documentName}`);
  },

  extensions: [
    new Database({
      async fetch({ documentName }) {
        console.log(`[db:fetch] ${documentName}`);
        const doc = await prisma.yjsDocument.findUnique({
          where: { name: documentName },
        });
        return doc?.data ? new Uint8Array(doc.data) : null;
      },

      async store({ documentName, state }) {
        console.log(`[db:store] ${documentName} (${state.byteLength} bytes)`);
        await prisma.yjsDocument.upsert({
          where: { name: documentName },
          create: { name: documentName, data: Buffer.from(state) },
          update: { data: Buffer.from(state) },
        });
      },
    }),
  ],
});

server.listen().then(() => {
  console.log(`Hocuspocus collab server running on port ${process.env.PORT ?? 3005}`);
});
