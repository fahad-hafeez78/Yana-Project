const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    GOOGLE_MAP_KEY: Joi.string().required().description('Google Map API key'),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    ACCESS_TOKEN_SECRET: Joi.string().required().description('JWT Access secret key'),
    REFRESH_TOKEN_SECRET: Joi.string().required().description('JWT Refresh secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    S3_BUCKET_NAME: Joi.string().description('s3 bucket name to store images'),
    S3_BUCKET_REGION: Joi.string().description('s3 bucket region'),
    S3_BUCKET_ACCESS_KEY: Joi.string().description('s3 bucket access key'),
    S3_BUCKET_SECRET_KEY: Joi.string().description('s3 bucket secret key'),
    SMTP_SERVICE: Joi.string().description('service name that will send the emails'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    SMTP_ENCRYPTION: Joi.string().description('secure config'),
    TWILIO_ACCOUNT_SID: Joi.string().required().description('twilio account SID'),
    TWILIO_AUTH_TOKEN: Joi.string().required().description('twilio account auth token'),
    TWILIO_FROM_NUMBER: Joi.string().required().description('twilio from number'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  google_map_key: envVars.GOOGLE_MAP_KEY,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === "test" ? '-test' : ''),
    // url: envVars.MONGODB_URL,
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    },
  },
  jwt: {
    access_token_secret: envVars.ACCESS_TOKEN_SECRET,
    refresh_token_secret: envVars.REFRESH_TOKEN_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  s3: {
    bucket_name: envVars.S3_BUCKET_NAME,
    bucket_region: envVars.S3_BUCKET_REGION,
    bucket_accesskey: envVars.S3_BUCKET_ACCESS_KEY,
    bucket_secretkey: envVars.S3_BUCKET_SECRET_KEY,
  },
  smtp: {
    smtp_service: envVars.SMTP_SERVICE,
    smtp_host: envVars.SMTP_HOST,
    smtp_port: envVars.SMTP_PORT,
    smtp_username: envVars.SMTP_USERNAME,
    smtp_password: envVars.SMTP_PASSWORD,
    smtp_encryption: envVars.SMTP_ENCRYPTION,
  },
  twilioAccountSID: envVars.TWILIO_ACCOUNT_SID,
  twilioAuthToken: envVars.TWILIO_AUTH_TOKEN,
  twilioFromNum: envVars.TWILIO_FROM_NUMBER
};
