import { describe, it, expect } from 'vitest';

import { product } from '../../src/schemas/documents/product';

describe('Main', () => {
  
  it('should validate schemas', async () => {
    expect(product).toBeDefined();
  });

});