export const Stores = {};

Stores.images = new FS.Store.GridFS('images');
Stores.thumbs = new FS.Store.GridFS('thumbs');