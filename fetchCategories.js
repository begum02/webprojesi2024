const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('category')
      .select('*');
  
    if (error) {
      console.error('Kategoriler alınırken hata oluştu:', error.message);
    } else {
      console.log('Kategoriler:', data);
    }
  };
  
  fetchCategories();
  