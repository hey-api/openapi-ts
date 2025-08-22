import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@hey-api/openapi-ts';
import { describe, expect, it, vi } from 'vitest';

import { getSpecsPath } from '../../../utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = '3.1.x';
const outputDir = path.join(__dirname, 'generated', version, 'functional');

describe('@pinia/colada functional tests', () => {
  const setupPiniaColadaTest = async (pluginConfig: any = {}) => {
    const inputPath = path.join(getSpecsPath(), version, 'petstore.yaml');
    
    await createClient({
      input: inputPath,
      output: outputDir,
      logs: { level: 'silent' },
      plugins: [
        '@hey-api/client-fetch',
        '@hey-api/sdk',
        {
          name: '@pinia/colada',
          ...pluginConfig,
        },
      ],
    });

    // Clear the require cache to ensure fresh imports
    const piniaColadaPath = path.join(outputDir, '@pinia/colada.gen.js');
    delete require.cache[piniaColadaPath];

    // Dynamically import the generated code
    const piniaColada = await import(piniaColadaPath);
    return piniaColada;
  };

  it('should generate query options with correct structure', async () => {
    const piniaColada = await setupPiniaColadaTest();

    // Check that query functions exist
    expect(piniaColada.getPetByIdQuery).toBeDefined();
    expect(piniaColada.findPetsByStatusQuery).toBeDefined();

    // Test the query options structure
    const queryOptions = piniaColada.getPetByIdQuery({ path: { petId: 1 } });
    
    expect(queryOptions).toHaveProperty('key');
    expect(queryOptions).toHaveProperty('query');
    expect(queryOptions.key).toEqual(['getPetById', { petId: 1 }]);
    expect(typeof queryOptions.query).toBe('function');
  });

  it('should generate mutation options with correct structure', async () => {
    const piniaColada = await setupPiniaColadaTest();

    // Check that mutation functions exist
    expect(piniaColada.addPetMutation).toBeDefined();
    expect(piniaColada.updatePetMutation).toBeDefined();
    expect(piniaColada.deletePetMutation).toBeDefined();

    // Test the mutation options structure
    const mutationOptions = piniaColada.addPetMutation();
    
    expect(mutationOptions).toHaveProperty('mutation');
    expect(typeof mutationOptions.mutation).toBe('function');
  });

  it('should respect autoDetectHttpMethod setting', async () => {
    const piniaColadaDefault = await setupPiniaColadaTest({ autoDetectHttpMethod: true });
    
    // With auto-detection, GET should be query, POST should be mutation
    expect(piniaColadaDefault.getPetByIdQuery).toBeDefined(); // GET -> query
    expect(piniaColadaDefault.addPetMutation).toBeDefined(); // POST -> mutation
    expect(piniaColadaDefault.addPetQuery).toBeUndefined(); // POST should not generate query

    const piniaColadaDisabled = await setupPiniaColadaTest({ autoDetectHttpMethod: false });
    
    // With auto-detection disabled, both GET and POST should generate queries (legacy behavior)
    expect(piniaColadaDisabled.getPetByIdQuery).toBeDefined();
    // Note: The legacy behavior test might need adjustment based on actual implementation
  });

  it('should respect operation type overrides', async () => {
    const piniaColada = await setupPiniaColadaTest({
      operationTypes: {
        getPetById: 'both',
        addPet: 'query',
      },
    });

    // getPetById should generate both query and mutation
    expect(piniaColada.getPetByIdQuery).toBeDefined();
    expect(piniaColada.getPetByIdMutation).toBeDefined();

    // addPet should only generate query (overriding default mutation for POST)
    expect(piniaColada.addPetQuery).toBeDefined();
    expect(piniaColada.addPetMutation).toBeUndefined();
  });

  it('should generate files by tag when groupByTag is enabled', async () => {
    await createClient({
      input: path.join(getSpecsPath(), version, 'petstore.yaml'),
      output: path.join(outputDir, 'grouped'),
      logs: { level: 'silent' },
      plugins: [
        '@hey-api/client-fetch',
        '@hey-api/sdk',
        {
          name: '@pinia/colada',
          groupByTag: true,
        },
      ],
    });

    // Check that separate files are created for each tag
    const petFile = path.join(outputDir, 'grouped', '@pinia/colada/pet.gen.ts');
    const storeFile = path.join(outputDir, 'grouped', '@pinia/colada/store.gen.ts');
    const userFile = path.join(outputDir, 'grouped', '@pinia/colada/user.gen.ts');

    expect(fs.existsSync(petFile)).toBe(true);
    expect(fs.existsSync(storeFile)).toBe(true);
    expect(fs.existsSync(userFile)).toBe(true);

    // Check that pet operations are in pet file
    const petContent = fs.readFileSync(petFile, 'utf-8');
    expect(petContent).toContain('getPetByIdQuery');
    expect(petContent).toContain('addPetMutation');
    expect(petContent).not.toContain('getInventoryQuery'); // Should be in store file
  });

  it('should generate index file when exportFromIndex is enabled', async () => {
    await createClient({
      input: path.join(getSpecsPath(), version, 'petstore.yaml'),
      output: path.join(outputDir, 'with-index'),
      logs: { level: 'silent' },
      plugins: [
        '@hey-api/client-fetch',
        '@hey-api/sdk',
        {
          name: '@pinia/colada',
          groupByTag: true,
          exportFromIndex: true,
        },
      ],
    });

    // Check that index file is created
    const indexFile = path.join(outputDir, 'with-index', '@pinia/colada/index.gen.ts');
    expect(fs.existsSync(indexFile)).toBe(true);

    // Check that index file exports from other files
    const indexContent = fs.readFileSync(indexFile, 'utf-8');
    expect(indexContent).toContain('export * from "./pet"');
    expect(indexContent).toContain('export * from "./store"');
    expect(indexContent).toContain('export * from "./user"');
  });

  it('should include meta properties in generated code', async () => {
    await createClient({
      input: path.join(getSpecsPath(), version, 'petstore.yaml'),
      output: path.join(outputDir, 'with-meta'),
      logs: { level: 'silent' },
      plugins: [
        '@hey-api/client-fetch',
        '@hey-api/sdk',
        {
          name: '@pinia/colada',
          queryOptions: {
            meta: (operation) => ({
              operationId: operation.id,
              httpMethod: operation.method,
            }),
          },
          mutationOptions: {
            meta: (operation) => ({
              operationId: operation.id,
              httpMethod: operation.method,
            }),
          },
        },
      ],
    });

    const generatedFile = path.join(outputDir, 'with-meta', '@pinia/colada.gen.ts');
    const content = fs.readFileSync(generatedFile, 'utf-8');

    // Check that meta properties are included
    expect(content).toContain('operationId');
    expect(content).toContain('httpMethod');
  });

  it('should handle query function calls with abort signal', async () => {
    const piniaColada = await setupPiniaColadaTest();
    
    const queryOptions = piniaColada.getPetByIdQuery({ path: { petId: 1 } });
    
    // Mock fetch to capture the call
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'Test Pet' }),
    });
    
    // Replace global fetch
    const originalFetch = global.fetch;
    global.fetch = mockFetch;

    try {
      const abortController = new AbortController();
      await queryOptions.query({ signal: abortController.signal });

      // Verify that the fetch was called with the abort signal
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: abortController.signal,
        })
      );
    } finally {
      // Restore original fetch
      global.fetch = originalFetch;
    }
  });

  it('should handle mutation function calls correctly', async () => {
    const piniaColada = await setupPiniaColadaTest();
    
    const mutationOptions = piniaColada.addPetMutation();
    
    // Mock fetch to capture the call
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 1, name: 'New Pet' }),
    });
    
    const originalFetch = global.fetch;
    global.fetch = mockFetch;

    try {
      const petData = { name: 'Test Pet', photoUrls: [] };
      await mutationOptions.mutation({ body: petData });

      // Verify that the fetch was called with the pet data
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test Pet'),
        })
      );
    } finally {
      global.fetch = originalFetch;
    }
  });
});