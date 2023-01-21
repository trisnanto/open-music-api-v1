const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    // handler: (request, h) => handler.postAlbumHandler(request, h),
    handler: handler.postAlbumHandler,
  },
  {
    method: 'GET',
    path: '/albums/{id}',
    // handler: (request, h) => handler.getAlbumByIdHandler(request, h),
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    // handler: (request, h) => handler.putAlbumByIdHandler(request, h),
    handler: handler.putAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    // handler: (request, h) => handler.deleteAlbumByIdHandler(request, h),
    handler: handler.deleteAlbumByIdHandler,
  },
];

module.exports = routes;
