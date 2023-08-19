process.env.DESTINATION_BUCKET = 'dest-bucket';

const mockedS3 = {
  copyObject: jest.fn(),
  deleteObject: jest.fn(),
};

jest.mock('@aws-sdk/client-s3', () => {
  return { S3: jest.fn(() => mockedS3) };
});

afterAll(() => {
  jest.resetAllMocks();
});

afterEach(() => {
  Object.keys(mockedS3).forEach((key) => mockedS3[key].mockReset());

  jest.clearAllMocks();
});
