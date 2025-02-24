export const RABBITMQ_CONFIG = {
  exchanges: {
    users: 'users.exchange',
    auth: 'auth.exchange'
  },
  queues: {
    userService: 'user-service.queue',
    authService: 'auth-service.queue'
  },
  routingKeys: {
    userCommands: 'user.commands.*',
    userEvents: 'user.events.*',
    userQueries: 'user.queries.*',
    authCommands: 'auth.commands.*',
    authEvents: 'auth.events.*'
  }
};

export const RABBITMQ_URI = process.env['RABBITMQ_URI'] || 'amqp://localhost:5672';
