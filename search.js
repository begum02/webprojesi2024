const supabase = require('./SupabaseClient'); // Supabase istemcisi

async function searchData(searchQuery) {
    if (!searchQuery || searchQuery.trim() === "") {
        console.error("Arama terimi gereklidir.");
        return [];
    }

    try {
        // 1. Adım: audio_book tablosunda arama yapıyoruz
        const { data: audioBooks, error: audioBookError } = await supabase
            .from('audio_book')
            .select('id, title, category_id')
            .ilike('title', `%${searchQuery}%`);

        if (audioBookError) {
            console.error('Audio Book Arama Hatası:', audioBookError.message);
        } else if (audioBooks.length === 0) {
            console.log('audio_book tablosunda sonuç bulunamadı.');
        }

        // 2. Adım: category tablosunda arama yapıyoruz (kategori adında)
        const { data: categories, error: categoryError } = await supabase
            .from('category')
            .select('id, name')
            .ilike('name', `%${searchQuery}%`);

        if (categoryError) {
            console.error('Category Arama Hatası:', categoryError.message);
        } else if (categories.length === 0) {
            console.log('Category tablosunda sonuç bulunamadı.');
        }

        // 3. Adım: audio_books ve categories verilerini birleştiriyoruz
        const results = audioBooks.filter(audioBook => {
            const category = categories.find(c => c.id === audioBook.category_id);
            return category !== undefined; // Eğer kategori bulunmuşsa
        }).map(audioBook => {
            const category = categories.find(c => c.id === audioBook.category_id);
            return {
                audio_book_id: audioBook.id,
                audio_book_title: audioBook.title,
                category_name: category ? category.name : 'N/A',
            };
        });

        // 4. Adım: book tablosunda arama yapıyoruz
        const { data: books, error: bookError } = await supabase
            .from('book')
            .select('id, title')
            .ilike('title', `%${searchQuery}%`);

        if (bookError) {
            console.error('Book Arama Hatası:', bookError.message);
        } else if (books.length === 0) {
            console.log('Book tablosunda sonuç bulunamadı.');
        }

        // 5. Adım: Book ve category verilerini filtreliyoruz
        const bookResults = books.filter(book => {
            return categories.some(category => category.id === book.category_id);
        }).map(book => ({
            book_id: book.id,
            book_title: book.title,
        }));

        // Sonuçları döndürüyoruz
        return {
            audio_books: results,   // Audio book ve kategori sonuçları
            books: bookResults      // Book tablosu sonuçları
        };

    } catch (err) {
        console.error('Beklenmeyen hata:', err.message);
        return [];
    }
}

// Arama fonksiyonunu çağırma
searchData('Roman')  // Bu terimle arama yapılacak
    .then(data => console.log(data))
    .catch(error => console.error(error));
