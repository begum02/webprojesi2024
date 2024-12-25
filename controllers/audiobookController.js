const supabase = require('../SupabaseClient'); // Supabase istemcisi


const getAudioBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('audio_books')
        .select(`
          title,
          cover_image,
          author:author_id (name),
          category:category_id (name)
        `);  // Author ve Category tablolarındaki isimleri alıyoruz
  
      if (error) {
        throw new Error(error.message);
      }
  
      return data; // Alınan verileri döndür
    } catch (err) {
      console.error('Hata:', err.message);
      return [];
    }
  };
  const getAudiobookDetails = async (audiobookId) => {
    try {
      // Audiobook ve ilgili yazar ve kategori bilgilerini almak
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
        `)
        .eq('id', audiobookId)
        .single(); // Tek bir kitap dönecek
  
      if (error) {
        console.error('Error fetching audiobook:', error);
        return null;
      }
  
      const result = {
        ...data,
        author: data.author.name, // Yazarın adı
        category: data.category.name // Kategorinin adı
      };
  
      console.log(result);  // Burada sonucu logluyoruz
  
      return result;
    
  
  
    } catch (error) {
      console.error('Error executing function:', error);
      return null;
    }
  };
  
  const getFavoriteAudiobooks = async () => {
    try {
        const { data, error } = await supabase
            .from('audio_book')
            .select(`
                id,
                title,
                cover_image,
                author:author_id (name),
                isFavorite
            `)
            .eq('isFavorite', true);

        if (error) {
            console.error('Error fetching favorite audiobooks:', error);
            throw error;
        }

        return data.map(book => ({
            id: book.id,
            title: book.title,
            author: book.author?.name || 'Unknown Author',
            cover_image: book.cover_image
        }));
    } catch (err) {
        console.error('Error in getFavoriteAudiobooks:', err);
        return [];
    }
};

const toggleAudiobookFavorite = async (bookId) => {
    try {
        const { data, error } = await supabase
            .from('audio_book')
            .select('isFavorite')
            .eq('id', bookId)
            .single();

        if (error) throw error;

        const newFavoriteStatus = !data.isFavorite;

        const { data: updatedData, error: updateError } = await supabase
            .from('audio_book')
            .update({ isFavorite: newFavoriteStatus })
            .eq('id', bookId)
            .single();

        if (updateError) throw updateError;

        return { isFavorite: newFavoriteStatus };
    } catch (err) {
        console.error('Error in toggleAudiobookFavorite:', err);
        throw err;
    }
};

  getAudiobookDetails(1)
  
  
  module.exports = {
    getAudiobookDetails,
    getAudioBooks,
    getFavoriteAudiobooks,
    toggleAudiobookFavorite
  };