import { closeTestContext } from './test-helper'

afterAll(async () => {
  await closeTestContext();
}, 15000);

