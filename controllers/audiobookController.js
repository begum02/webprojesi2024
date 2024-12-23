

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
  
  getAudiobookDetails(1)
  
  
  module.exports = {
    getAudiobookDetails,getAudioBooks
  };
  
  