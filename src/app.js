const utils = require('./utils');

const destBucket = process.env.DESTINATION_BUCKET;
const destKeyPrefix = process.env.DESTINATION_KEY_PREFIX ?? '';

const s3NotificationHandler = async (records) => {
  const moves = records.map((record) => {
    const {
      s3: {
        bucket: { name },
        object: { key },
      },
    } = record;

    return utils
      .moveAccessLog(name, key, destBucket, destKeyPrefix)
      .then(console.log)
      .catch(console.error);
  });

  await Promise.all(moves);
};

const s3BatchHandler = async (tasks, invocationSchemaVersion, invocationId) => {
  const moves = tasks.map((task) => {
    const { taskId, s3Key, s3BucketArn } = task;
    const arn = s3BucketArn.split(':');
    const bucket = arn[arn.length - 1];

    return utils
      .moveAccessLog(bucket, s3Key, destBucket, destKeyPrefix)
      .then((val) => {
        return {
          taskId,
          resultCode: 'Succeeded',
          resultString: val,
        };
      })
      .catch((err) => {
        return {
          taskId,
          resultCode: 'PermanentFailure',
          resultString: err.toString(),
        };
      });
  });

  const results = await Promise.all(moves);

  return {
    invocationSchemaVersion,
    treatMissingKeysAs: 'PermanentFailure',
    invocationId,
    results,
  };
};

exports.handler = async (event) => {
  const { Records, invocationSchemaVersion, invocationId, tasks } = event;

  if (Records !== undefined) {
    await s3NotificationHandler(Records);
  } else if (
    invocationSchemaVersion !== undefined &&
    invocationId !== undefined &&
    tasks !== undefined
  ) {
    return await s3BatchHandler(tasks, invocationSchemaVersion, invocationId);
  }
};
