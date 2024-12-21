const supabase = require('./SupabaseClient'); // Supabase istemcisi

async function fetchAuthors() {
    try {
      // author tablosundan sadece id, name ve author_image sütunlarını al
      const { data, error } = await supabase
        .from('author') // Tablo adı
        .select('id, name, author_image'); // Çekilecek sütunlar
  
      if (error) {
        console.error('Veri çekilirken bir hata oluştu:', error.message);
        return;
      }
  
      console.log('Yazarlar:', data);
      return data;
    } catch (err) {
      console.error('Beklenmeyen hata:', err.message);
    }
  }
  
  module.exports={
    fetchAuthors
  };