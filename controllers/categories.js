// supabaseClient.js
const supabase = require('../SupabaseClient'); // Supabase istemcisi



// Kategorileri çekme
async function getCategories() {
  const { data, error } = await supabase.from('category').select('*');
  if (error) {
    console.error('Error fetching categories:', error.message);
    return [];
  }
  return data;
}

// Kategori ID'sine göre kitapları çekme
async function getBooksByCategory(categoryId) {
  const { data, error } = await supabase
    .from('book')
    .select('id, cover_image')
    .eq('category_id', categoryId);  // kategori id'ye göre kitapları filtrele
  
  if (error) {
    console.error('Error fetching books:', error.message);
    return [];
  }
  return data;
}

module.exports = { getCategories, getBooksByCategory };
