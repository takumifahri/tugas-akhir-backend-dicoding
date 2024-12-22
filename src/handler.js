const { nanoid } = require('nanoid');
const books = require('./books');

// Handler for add new books
const addBooks = (request, h) => {
  const { name, pageCount, readPage, ...body } = request.payload;

  // check if name is undefined or not exists on request.payload
  if (name === undefined) {
    return h
      .response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku',
      })
      .code(400);
  }

  // check if readPage > pageCount
  if (readPage > pageCount) {
    return h
      .response({
        status: 'fail',
        message:
            'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      })
      .code(400);
  }

  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBooks = {
    id: nanoid(16),
    name,
    ...body,
    finished,
    pageCount,
    readPage,
    insertedAt,
    updatedAt,
  };

  books.push(newBooks);

  return h
    .response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: newBooks.id,
      },
    })
    .code(201);
};

// Handler for get all books
const getAllBooks = (request, h) => {
  const { reading, finished, name } = request.query;
  let newFormatBooks;

  if (reading !== undefined) {
    // apply reading filter to books
    newFormatBooks = books
      .filter((book) => book.reading === (reading === '1'))
      .map((book) => {
        const { id, name, publisher } = book;
        return { id, name, publisher };
      });
  } else if (finished !== undefined) {
    // apply finished filter to books
    newFormatBooks = books
      .filter((book) => book.finished === (finished === '1'))
      .map((book) => {
        const { id, name, publisher } = book;
        return { id, name, publisher };
      });
  } else if (name !== undefined) {
    // apply name filter to books
    newFormatBooks = books
      .filter((book) => book.name.toLowerCase().includes(name.toLowerCase()))
      .map((book) => {
        const { id, name, publisher } = book;
        return { id, name, publisher };
      });
  } else {
    // format books to take only id, name, and publisher
    newFormatBooks = books.map((book) => {
      const { id, name, publisher } = book;
      return { id, name, publisher };
    });
  }

  return h
    .response({
      status: 'success',
      data: {
        books: newFormatBooks,
      },
    })
    .code(200);
};

// Handler for find books by id
const getBooksById = (request, h) => {
  const { id } = request.params;

  const book = books.filter((b) => b.id === id)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book: book,
      },
    };
  }

  // handle if id is not found on books
  return h
    .response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    })
    .code(404);
};

// Handler for update books by id
const updateBookById = (request, h) => {
  const { id } = request.params;

  const { name, pageCount, readPage, ...body } = request.payload;

  // check if name is undefined / dont exists on request.payload
  if (name === undefined) {
    return h
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      })
      .code(400);
  }

  // check if readPage > pageCount
  if (readPage > pageCount) {
    return h
      .response({
        status: 'fail',
        message:
          'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      })
      .code(400);
  }

  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      pageCount,
      readPage,
      updatedAt,
      ...body
    };

    return h
      .response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      })
      .code(200);
  }

  // handle if id is not found on books
  return h
    .response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    })
    .code(404);
};

// Handler for delete books by id
const deleteById = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    return h
      .response({
        status: 'success',
        message: 'Buku berhasil dihapus',
      })
      .code(200);
  }

  // handle if id is not found on books
  return h
    .response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    })
    .code(404);
};

module.exports = {
  addBooks,
  getAllBooks,
  getBooksById,
  updateBookById,
  deleteById,
};