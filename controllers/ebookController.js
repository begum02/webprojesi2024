const supabase = require('../SupabaseClient'); // Supabase istemcisi



const fetchBooks = async () => {
    const { data, error } = await supabase
        .from('book') // Tablo adı
        .select('title, cover_image, author (name)'); // İlişkili `author` tablosundan `name`

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    console.log('Books:', data);
    return data; // Veriyi geri döndür
};

async function getEbookDetails(ebookId) {
  try {
    const { data, error } = await supabase
      .from('book')
      .select('title, author(name), published_date, description, rating, cover_image')
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

module.exports = {
  fetchBooks,
  getEbookDetails
};
