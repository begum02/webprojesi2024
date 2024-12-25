const supabase = require('../SupabaseClient'); // Supabase istemcisi



const fetchBooks = async () => {
    const { data, error } = await supabase
        .from('book')
        .select('id, title, cover_image, author (name), isFavorite');

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    return data;
};

async function getEbookDetails(ebookId) {
  try {
    const { data, error } = await supabase
      .from('book')
      .select('title, author(name), published_date, description, rating, cover_image,isFavorite')
      .eq('id', ebookId)
      .single();
    
    if (error) {
      console.error('Error fetching ebook details:', error.message);
      throw new Error('Ebook details not found');
    }

    // Format the date with dots
    const formattedDate = data.published_date ? 
      new Date(data.published_date).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '.') : '';

    // Return formatted data
    return {
      ...data,
      author: data.author?.name || 'Unknown Author', // Extract name from author object
      published_date: formattedDate
    };

  } catch (err) {
    console.error('Error in getEbookDetails:', err.message);
    throw err;
  }
}

const getFavoriteBooks = async () => {
    try {
        const { data, error } = await supabase
            .from('book')
            .select(`
                id,
                title,
                cover_image,
                author:author_id (name),
                isFavorite
            `)
            .eq('isFavorite', true);

        if (error) {
            console.error('Error fetching favorite books:', error);
            throw error;
        }

        return data.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author?.name || 'Unknown Author',
            cover_image: book.cover_image
        }));
    } catch (err) {
        console.error('Error in getFavoriteBooks:', err);
        throw err;
    }
};

module.exports = {
  fetchBooks,
  getEbookDetails,
  getFavoriteBooks
};
