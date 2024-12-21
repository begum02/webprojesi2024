
const supabase = require('./SupabaseClient'); // Supabase istemcisi



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



module.exports = {
   fetchBooks
  };