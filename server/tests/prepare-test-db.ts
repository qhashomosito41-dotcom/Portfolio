import setup from './global-setup';

setup()
  .then(() => {
    console.log('Test database prepared.');
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
