
const supabase = require('./SupabaseClient'); // Supabase istemcisi
// Popüler kitapları almak için fonksiyon
async function getTopBooks() {
  try {
    // Rating tablosundan kitapların puanlarını alıyoruz
    const { data: ratingData, error: ratingError } = await supabase
      .from('rating')
      .select('book_id, score');
    
    if (ratingError) {
      throw new Error(ratingError.message);
    }

    // Book ve Author tablosundan kitap bilgilerini alıyoruz
    const { data: bookData, error: bookError } = await supabase
      .from('book')
      .select('id, title, cover_image, author_id');
    
    if (bookError) {
      throw new Error(bookError.message);
    }

    const { data: authorData, error: authorError } = await supabase
      .from('author')
      .select('id, name');
    
    if (authorError) {
      throw new Error(authorError.message);
    }

    // Rating verilerini kitaplarla birleştirip ortalama puanı hesaplıyoruz
    const booksWithAverageScore = bookData.map((book) => {
      const bookRatings = ratingData.filter(rating => rating.book_id === book.id);
      const averageScore = bookRatings.reduce((sum, rating) => sum + rating.score, 0) / bookRatings.length;
      
      
      const author = authorData.find((a) => a.id === book.author_id);

    
      const bookWithScore = {
        book_id: book.id,
        title: book.title,
        cover_image: book.cover_image,
        author_name: author ? author.name : 'Unknown Author',
        average_score: averageScore || 0
      };

      // Ortalama puanı konsola yazdırıyoruz
      console.log(`${bookWithScore.title} - Average Rating: ${bookWithScore.average_score}`);

      return bookWithScore;
    });


    // Popüler kitapları sıralıyoruz
    const sortedBooks = booksWithAverageScore.sort((a, b) => b.average_score - a.average_score);
    
    return sortedBooks.slice(0, 10); // İlk 10 kitabı alıyoruz
  } catch (err) {
    console.error('Error fetching top books:', err.message);
    throw err;
  }
}

getTopBooks()

module.exports = {
  getTopBooks,
};