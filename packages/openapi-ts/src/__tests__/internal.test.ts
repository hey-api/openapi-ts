describe('internal entry index', () => {
  it('should be exported', { timeout: 10000 }, async () => {
    const internal = await import('../internal');
    expect(internal.getSpec).toBeDefined();
    expect(internal.initConfigs).toBeDefined();
    expect(internal.parseOpenApiSpec).toBeDefined();
  });
});
