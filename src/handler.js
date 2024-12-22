const { nanoid } = require('nanoid');
const books = require('./books');

// Helper function to create a response
const createResponse = (h, status, message, code, data = {}) => {
    return h.response({ status, message, ...data }).code(code);
};

// Handler for adding new books
const addBooks = (request, h) => {
    const { name, pageCount, readPage, ...body } = request.payload;

    if (!name) {
        return createResponse(h, 'fail', 'Gagal menambahkan buku. Mohon isi nama buku', 400);
    }

    if (readPage > pageCount) {
        return createResponse(h, 'fail', 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount', 400);
    }

    const newBook = {
        id: nanoid(16),
        name,
        ...body,
        finished: pageCount === readPage,
        pageCount,
        readPage,
        insertedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    books.push(newBook);

    return createResponse(h, 'success', 'Buku berhasil ditambahkan', 201, { data: { bookId: newBook.id } });
};

// Handler for getting all books
const getAllBooks = (request, h) => {
    const { reading, finished, name } = request.query;

    const filteredBooks = books.filter((book) => {
        if (reading !== undefined && book.reading !== (reading === '1')) return false;
        if (finished !== undefined && book.finished !== (finished === '1')) return false;
        if (name !== undefined && !book.name.toLowerCase().includes(name.toLowerCase())) return false;
        return true;
    });

    const formattedBooks = filteredBooks.map(({ id, name, publisher }) => ({ id, name, publisher }));

    return createResponse(h, 'success', null, 200, { data: { books: formattedBooks } });
};

// Handler for finding books by id
const getBooksById = (request, h) => {
    const { id } = request.params;
    const book = books.find((b) => b.id === id);

    if (book) {
        return createResponse(h, 'success', null, 200, { data: { book } });
    }

    return createResponse(h, 'fail', 'Buku tidak ditemukan', 404);
};

// Handler for updating books by id
const updateBookById = (request, h) => {
    const { id } = request.params;
    const { name, pageCount, readPage, ...body } = request.payload;

    if (!name) {
        return createResponse(h, 'fail', 'Gagal memperbarui buku. Mohon isi nama buku', 400);
    }

    if (readPage > pageCount) {
        return createResponse(h, 'fail', 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount', 400);
    }

    const index = books.findIndex((book) => book.id === id);

    if (index !== -1) {
        books[index] = {
            ...books[index],
            name,
            pageCount,
            readPage,
            updatedAt: new Date().toISOString(),
            ...body,
        };

        return createResponse(h, 'success', 'Buku berhasil diperbarui', 200);
    }

    return createResponse(h, 'fail', 'Gagal memperbarui buku. Id tidak ditemukan', 404);
};

// Handler for deleting books by id
const deleteById = (request, h) => {
    const { id } = request.params;
    const index = books.findIndex((book) => book.id === id);

    if (index !== -1) {
        books.splice(index, 1);
        return createResponse(h, 'success', 'Buku berhasil dihapus', 200);
    }

    return createResponse(h, 'fail', 'Buku gagal dihapus. Id tidak ditemukan', 404);
};

module.exports = {
    addBooks,
    getAllBooks,
    getBooksById,
    updateBookById,
    deleteById,
};
