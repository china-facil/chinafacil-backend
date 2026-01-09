'use strict'

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'ChinaFacil Backend'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  
  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
    filepath: 'stdout',
  },

  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true,
      max_samples_stored: 10000,
    },
    metrics: {
      enabled: true,
    },
    local_decorating: {
      enabled: true,
    },
  },

  distributed_tracing: {
    enabled: true,
  },

  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated',
    explain_threshold: 500,
  },

  error_collector: {
    enabled: true,
    ignore_status_codes: [404],
    capture_events: true,
    max_event_samples_stored: 100,
  },

  allow_all_headers: true,
  
  attributes: {
    enabled: true,
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  },
}


