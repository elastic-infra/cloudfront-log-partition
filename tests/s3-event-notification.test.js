const lambda = require('app');
const { S3 } = require('@aws-sdk/client-s3');

describe('S3EventNotification', () => {
  const event = (key = 'path/to/E2PJ60DBC3ADBD.2022-10-05-15.2518c96c.gz') => {
    return {
      Records: [
        {
          s3: {
            bucket: {
              name: 'src-bucket',
              arn: 'arn:aws:s3:::src-bucket',
            },
            object: {
              key: key,
            },
          },
        },
      ],
    };
  };
  const logSpy = jest.spyOn(console, 'log');
  const errorSpy = jest.spyOn(console, 'error');

  it('expect Succeeded', async () => {
    const request = event();
    await lambda.handler(request);

    expect(logSpy.mock.calls[0][0]).toBe(
      'Moved src-bucket/path/to/E2PJ60DBC3ADBD.2022-10-05-15.2518c96c.gz to dest-bucket/path/to/2022/10/05/15/E2PJ60DBC3ADBD.2022-10-05-15.2518c96c.gz.',
    );
  });

  it('expect Succeeded when object key is not cloudfront log', async () => {
    const request = event('dummy.gz');
    await lambda.handler(request);

    expect(logSpy.mock.calls[0][0]).toBe(
      'Object key dummy.gz does not look like an access log file, so it will not be moved.',
    );
  });

  it('expect PermanentFailure when reject', async () => {
    const s3 = new S3();
    s3.copyObject.mockRejectedValue(new Error('Network'));

    const request = event();
    await lambda.handler(request);

    expect(errorSpy.mock.calls[0][0].toString()).toBe(
      'Error: Error while moving src-bucket/path/to/E2PJ60DBC3ADBD.2022-10-05-15.2518c96c.gz to dest-bucket/path/to/2022/10/05/15/E2PJ60DBC3ADBD.2022-10-05-15.2518c96c.gz: Error: Network',
    );
  });
});
