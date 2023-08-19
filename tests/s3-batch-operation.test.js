const lambda = require('app');
const { S3 } = require('@aws-sdk/client-s3');

describe('S3BatchOperation', () => {
  const event = (key = 'path/to/E2PJ60DBC3ADBD.2022-10-05-15.2518c96c.gz') => {
    return {
      invocationSchemaVersion: '1.0',
      invocationId: 'YXNkbGZqYWRmaiBhc2RmdW9hZHNmZGpmaGFzbGtkaGZza2RmaAo',
      tasks: [
        {
          taskId: 'dGFza2lkZ29lc2hlcmUK',
          s3Key: key,
          s3VersionId: '1',
          s3BucketArn: 'arn:aws:s3:::src-bucket',
        },
      ],
    };
  };

  it('expect Succeeded', async () => {
    const request = event();
    const response = await lambda.handler(request);

    expect(response.invocationSchemaVersion).toBe(request.invocationSchemaVersion);
    expect(response.results[0].taskId).toBe(request.tasks[0].taskId);
    expect(response.results[0].resultCode).toBe('Succeeded');
    expect(response.results[0].resultString).toBe(
      'Moved src-bucket/path/to/E2PJ60DBC3ADBD.2022-10-05-15.2518c96c.gz to dest-bucket/path/to/2022/10/05/15/E2PJ60DBC3ADBD.2022-10-05-15.2518c96c.gz.',
    );
  });

  it('expect Succeeded when object key is not cloudfront log', async () => {
    const request = event('dummy.gz');
    const response = await lambda.handler(request);

    expect(response.invocationSchemaVersion).toBe(request.invocationSchemaVersion);
    expect(response.results[0].taskId).toBe(request.tasks[0].taskId);
    expect(response.results[0].resultCode).toBe('Succeeded');
    expect(response.results[0].resultString).toBe(
      'Object key dummy.gz does not look like an access log file, so it will not be moved.',
    );
  });

  it('expect PermanentFailure when reject', async () => {
    const s3 = new S3();
    s3.copyObject.mockRejectedValue(new Error('Network'));

    const request = event();
    const response = await lambda.handler(request);

    expect(response.invocationSchemaVersion).toBe(request.invocationSchemaVersion);
    expect(response.results[0].taskId).toBe(request.tasks[0].taskId);
    expect(response.results[0].resultCode).toBe('PermanentFailure');
    expect(response.results[0].resultString).toBe(
      'Error: Error while moving src-bucket/path/to/E2PJ60DBC3ADBD.2022-10-05-15.2518c96c.gz to dest-bucket/path/to/2022/10/05/15/E2PJ60DBC3ADBD.2022-10-05-15.2518c96c.gz: Error: Network',
    );
  });
});
