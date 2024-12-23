const supabase = require('../SupabaseClient'); // Supabase istemcisi

// Popüler kitapları almak için fonksiyon
async function getTopBooks() {
  try {
    // Get ratings from both ebook_rating and audio_book_rating tables
    const { data: ebookRatings, error: ebookRatingError } = await supabase
      .from('ebook_rating')
      .select('book_id, score');
    
    const { data: audioRatings, error: audioRatingError } = await supabase
      .from('audio_book_rating')
      .select('book_id, score');

    if (ebookRatingError) {
      console.error('Error fetching ebook ratings:', ebookRatingError);
    }

    if (audioRatingError) {
      console.error('Error fetching audio ratings:', audioRatingError);
    }

    // Get books data
    const { data: books, error: bookError } = await supabase
      .from('book')
      .select(`
        id,
        title,
        cover_image,
        author:author_id (name)
      `);

    if (bookError) {
      throw new Error(bookError.message);
    }

    // Combine ratings and calculate averages
    const ratings = [...(ebookRatings || []), ...(audioRatings || [])];
    const bookRatings = {};

    ratings.forEach(rating => {
      if (!bookRatings[rating.book_id]) {
        bookRatings[rating.book_id] = {
          total: 0,
          count: 0
        };
      }
      bookRatings[rating.book_id].total += rating.score;
      bookRatings[rating.book_id].count += 1;
    });

    // Add average ratings to books
    const booksWithRatings = books.map(book => ({
      ...book,
      averageRating: bookRatings[book.id] 
        ? (bookRatings[book.id].total / bookRatings[book.id].count).toFixed(1)
        : '0.0'
    }));

    // Sort by average rating
    return booksWithRatings.sort((a, b) => b.averageRating - a.averageRating);

  } catch (err) {
    console.error('Error getting top books:', err);
    throw err;
  }
}

module.exports = {
  getTopBooks
};