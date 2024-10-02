import { format, transports, createLogger } from "winston";

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${level} ${timestamp}: ${message}`;
});

const currentDate = new Date();

const currentYear = currentDate.getFullYear();

const currentMonth = currentDate.getMonth();

const realMonth = currentMonth + 1;

export const loggerUsers = createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: `logs/users/users_${currentYear}_${realMonth}.error.log`,
      level: "error",
    }),
    new transports.File({
      filename: `logs/users/users_${currentYear}_${realMonth}.info.log`,
    }),
  ],
});

export const appLogger = createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: `logs/app/app_${currentYear}_${realMonth}.error.log`,
      level: "error",
    }),
    new transports.File({
      filename: `logs/app/app_${currentYear}_${realMonth}.info.log`,
    }),
  ],
});

// export const logServerErros = createLogger({
//   level: "info",
//   format: combine(timestamp(), logFormat),
//   transports: [
//     new transports.File({
//       filename: `logs/application/server_errors_${realMonth}_${currentYear}.error.log`,
//       level: "error",
//     }),
//     new transports.File({
//       filename: `logs/application/server_errors_${realMonth}_${currentYear}.info.log`,
//       level: "info",
//     }),
//     new transports.File({
//       filename: `logs/application/server_errors_${realMonth}_${currentYear}.warn.log`,
//       level: "warn",
//     }),
//     new transports.File({
//       filename: `logs/application/server_errors_${realMonth}_${currentYear}.debug.log`,
//       level: "debug",
//     }),
//   ],
// });

// export const logAPIPerformance = createLogger({
//   level: "info",
//   format: combine(timestamp(), logFormat),
//   transports: [
//     new transports.File({
//       filename: `logs/application/api_stats_${realMonth}_${currentYear}.error.log`,
//       level: "error",
//     }),
//     new transports.File({
//       filename: `logs/application/api_stats_${realMonth}_${currentYear}.info.log`,
//       level: "info",
//     }),
//     new transports.File({
//       filename: `logs/application/api_stats_${realMonth}_${currentYear}.warn.log`,
//       level: "warn",
//     }),
//     new transports.File({
//       filename: `logs/application/api_stats_${realMonth}_${currentYear}.debug.log`,
//       level: "debug",
//     }),
//   ],
// });

// export const logDBTransactions = createLogger({
//   level: "info",
//   format: combine(timestamp(), logFormat),
//   transports: [
//     new transports.File({
//       filename: `logs/db/db_transactions_${realMonth}_${currentYear}.error.log`,
//       level: "error",
//     }),
//     new transports.File({
//       filename: `logs/db/db_transactions_${realMonth}_${currentYear}.info.log`,
//       level: "info",
//     }),
//     new transports.File({
//       filename: `logs/db/db_transactions_${realMonth}_${currentYear}.warn.log`,
//       level: "warn",
//     }),
//     new transports.File({
//       filename: `logs/db/db_transactions_${realMonth}_${currentYear}.debug.log`,
//       level: "debug",
//     }),
//   ],
// });

// export const logDBQueries = createLogger({
//   level: "info",
//   format: combine(timestamp(), logFormat),
//   transports: [
//     new transports.File({
//       filename: `logs/db/db_queries_${realMonth}_${currentYear}.error.log`,
//       level: "error",
//     }),
//     new transports.File({
//       filename: `logs/db/db_queries_${realMonth}_${currentYear}.info.log`,
//       level: "info",
//     }),
//     new transports.File({
//       filename: `logs/db/db_queries_${realMonth}_${currentYear}.warn.log`,
//       level: "warn",
//     }),
//     new transports.File({
//       filename: `logs/db/db_queries_${realMonth}_${currentYear}.debug.log`,
//       level: "debug",
//     }),
//   ],
// });

// export const logMails = createLogger({
//   level: "info",
//   format: combine(timestamp(), logFormat),
//   transports: [
//     new transports.File({
//       filename: `logs/mails/mails_${realMonth}_${currentYear}.error.log`,
//       level: "error",
//     }),
//     new transports.File({
//       filename: `logs/mails/mails_${realMonth}_${currentYear}.info.log`,
//       level: "info",
//     }),
//   ],
// });
