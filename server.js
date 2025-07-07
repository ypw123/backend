const fastify = require('fastify')({ logger: true, bodyLimit: 10 * 1024 * 1024 });
const analyzeImage = require('./analyze');
const fastifyMultipart = require('@fastify/multipart');
const fastifyCors = require('@fastify/cors');
require('dotenv').config();

fastify.register(fastifyCors);
fastify.register(fastifyMultipart);

fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

fastify.post('/analyze-image', async (request, reply) => {
  let image_base64;
  if (request.body && request.body.image_base64) {
    image_base64 = request.body.image_base64;
  } else {
    return reply.code(400).send({ error: '缺少 image_base64 字段' });
  }
  try {
    const result = await analyzeImage(image_base64);
    return reply.send(result);
  } catch (e) {
    return reply.code(500).send({ error: 'AI服务异常', detail: e.message });
  }
});

const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`server listening on http://0.0.0.0:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 