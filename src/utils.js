const path = require('path');
const { S3 } = require('@aws-sdk/client-s3');

const s3 = new S3({ apiVersion: '2006-03-01' });
const datePattern = '[^\\d](\\d{4})-(\\d{2})-(\\d{2})-(\\d{2})[^\\d]';

exports.moveAccessLog = async (srcBucket, srcKey, destBucket, destKeyPrefix) => {
  const sourceRegex = new RegExp(datePattern, 'g');
  const match = sourceRegex.exec(srcKey);

  if (match == null) {
    return `Object key ${srcKey} does not look like an access log file, so it will not be moved.`;
  }

  const parentName = path.dirname(srcKey);
  const filename = path.basename(srcKey);
  const [, year, month, day, hour] = match;

  const destKey = `${destKeyPrefix}${parentName}/${year}/${month}/${day}/${hour}/${filename}`;

  try {
    await s3.copyObject({
      CopySource: srcBucket + '/' + srcKey,
      Bucket: destBucket,
      Key: destKey,
    });

    await s3.deleteObject({
      Bucket: srcBucket,
      Key: srcKey,
    });

    return `Moved ${srcBucket}/${srcKey} to ${destBucket}/${destKey}.`;
  } catch (e) {
    throw new Error(`Error while moving ${srcBucket}/${srcKey} to ${destBucket}/${destKey}: ${e}`);
  }
};
