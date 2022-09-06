module.exports = ({ env }) => ({
  host: env('HOST', '34.123.112.7'),
  port: env.int('PORT', 80),
  urltomedia: 'http://34.123.112.7',
  app: {
    keys: env.array('APP_KEYS'),
  },
});
