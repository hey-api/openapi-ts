export default defineEventHandler(async (event) => {
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };

  const id = Number(getRouterParam(event, 'id'));

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Pet ID',
    });
  }

  try {
    // getPetById is auto-imported from #hey-api by @hey-api/nuxt
    // in the server environment, this uses @hey-api/client-ofetch
    const { data } = await getPetById({
      path: {
        petId: BigInt(id),
      },
    });

    return data;
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'Pet not found',
    });
  }
});
