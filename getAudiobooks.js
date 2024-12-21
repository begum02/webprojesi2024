


// getAudiobooks.js
const supabase = require('./SupabaseClient'); // Supabase istemcisi

// Tüm audiobooks'leri almak için fonksiyon
const getAudiobooks = async () => {
  try {
    // Tüm audiobooks verisini çekiyoruz
    const { data, error } = await supabase
      .from('audio_book')
      .select(`
        id, 
        title, 
        author_id, 
        cover_image, 
        audio_file, 
        description, 
        duration, 
        category_id,
        author(name), 
        category(name)
      `);

    if (error) {
      console.error('Error fetching audiobooks:', error);
      return null;
    }

    // Verileri döndür
    return data.map((book) => ({
      ...book,
      author: book.author.name, // Yazarın adı
      category: book.category.name // Kategorinin adı
    }));
  } catch (error) {
    console.error('Error executing function:', error);
    return null;
  }
};

module.exports = { getAudiobooks };
