const supabase = require('./SupabaseClient');

// Audiobook detaylarını almak için fonksiyon
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
  getAudiobookDetails
};
